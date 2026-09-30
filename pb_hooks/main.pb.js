// Invv backend extensions for PocketBase.
//
// Authentication uses PocketBase's built-in users auth collection
// (username/email + password). All custom routes below require a valid
// user auth token (Authorization: Bearer ...).

routerAdd("GET", "/api/invv/user", (e) => {
  const invv = require(`${__hooks}/invv.js`);
  const user = invv.userFromAuth(e.auth);
  return e.json(200, { user });
}, $apis.requireAuth());

// Send ZPL to a label printer via TCP port 9100.
// Optionally routes through a SOCKS5 proxy.
// Configuration via env vars:
//   INVV_PRINTER_HOST  - printer IP or hostname (required)
//   INVV_PRINTER_PORT  - printer port (default 9100)
//   INVV_SOCKS_PROXY   - SOCKS5 proxy "host:port" (optional)
routerAdd("POST", "/api/invv/print", (e) => {
  try {
    const data = new DynamicModel({ zpl: "" });
    e.bindBody(data);
    if (!data.zpl) throw new BadRequestError("zpl is required");

    const printerHost = $os.getenv("INVV_PRINTER_HOST") || "";
    const printerPort = $os.getenv("INVV_PRINTER_PORT") || "9100";
    const socksProxy = $os.getenv("INVV_SOCKS_PROXY") || "";

    if (!printerHost) throw new BadRequestError("Printer not configured (INVV_PRINTER_HOST)");

    let cmd;
    if (socksProxy) {
      const parts = socksProxy.split(":");
      const proxyHost = parts[0];
      const proxyPort = parts[1] || "1080";
      cmd = $os.cmd("socat", "STDIN", "SOCKS5:" + proxyHost + ":" + printerHost + ":" + printerPort + ",socksport=" + proxyPort);
    } else {
      cmd = $os.cmd("socat", "STDIN", "TCP:" + printerHost + ":" + printerPort + ",connect-timeout=5");
    }

    const pipe = cmd.stdinPipe();
    cmd.start();
    pipe.write(data.zpl);
    pipe.close();
    cmd.wait();

    return e.json(200, { success: true });
  } catch (err) {
    console.error("INVV print error:", err);
    if (err instanceof ApiError) throw err;
    throw new InternalServerError(err.message || String(err));
  }
}, $apis.requireAuth());

// Always record the acting user (from the auth token) on item_history.
onRecordCreateRequest((e) => {
  const invv = require(`${__hooks}/invv.js`);
  const info = e.requestInfo();
  e.record.set("user", invv.userFromAuth(info.auth));
  e.next();
}, "item_history");

// When a container is deleted, items are moved to the null ("unassigned") container
// instead of being cascade deleted, and the mutation is logged.
onRecordDeleteRequest((e) => {
  const invv = require(`${__hooks}/invv.js`);

  const items = e.app.findRecordsByFilter(
    "items",
    "container = {:id}",
    "-created",
    0,
    0,
    { id: e.record.id }
  );
  if (items.length === 0) {
    return;
  }

  const user = invv.userFromAuth(e.requestInfo().auth);
  const historyCollection = e.app.findCollectionByNameOrId("item_history");
  const containerName = e.record.getString("name");

  for (const item of items) {
    item.set("container", "");
    e.app.save(item);

    const history = new Record(historyCollection);
    history.set("item", item.id);
    history.set("action", "relocate");
    history.set("quantity", 0);
    history.set("user", user);
    history.set("note", 'container "' + containerName + '" deleted');
    e.app.save(history);
  }

  e.next();
});
