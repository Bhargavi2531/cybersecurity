const express = require("express");
const cors = require("cors");
const { HiveClient, TCLIService_types } = require("hive-driver");

const app = express();
app.use(cors());
app.use(express.json());

// Hive connection config
const hiveClient = new HiveClient(
  TCLIService_types.TProtocolVersion.HIVE_CLI_SERVICE_PROTOCOL_V10
);

async function connectHive() {
  await hiveClient.connect({
    host: "localhost",   // Hive server host
    port: 10000,         // Hive server port
    options: {
      transport: "TCP",
      username: "hiveuser",
      password: "hivepassword"
    }
  });
}

connectHive().then(() => console.log("✅ Connected to Hive")).catch(console.error);

// API endpoint to fetch threat stats (dummy table example)
app.get("/api/threats", async (req, res) => {
  try {
    const session = await hiveClient.openSession({ client_protocol: 0 });
    const query = "SELECT detection_rate, monitoring, support FROM security_stats LIMIT 1";
    const exec = await session.executeStatement(query);
    const result = await exec.fetchAll();

    res.json({
      success: true,
      data: result
    });

    await session.close();
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(5000, () => {
  console.log("🚀 Backend running on http://localhost:5000");
});
