import { OWNER_LID, PREFIX } from "../../config.js";
import fs from "fs";
import path from "path";

const DITADURA_FILE = path.resolve("database", "ditadura.json");

function getD() { try { return JSON.parse(fs.readFileSync(DITADURA_FILE, "utf8")); } catch { return {}; } }
function setD(d) { fs.writeFileSync(DITADURA_FILE, JSON.stringify(d, null, 2)); }

export default {
  name: "ditadura",
  description: "Modo ditadura: só Raquel fala no grupo.",
  commands: ["ditadura", "ditador"],
  usage: `${PREFIX}ditadura 1 / 0`,
  handle: async ({ args, socket, remoteJid, userLid, sendReply, sendSuccessReact }) => {
    if (userLid !== OWNER_LID) return sendReply("👑 Apenas a dona Raquel pode usar!");

    const data = getD();
    const a = args[0];

    if (a === "1") {
      data[remoteJid] = true;
      setD(data);
      // NÃO fecha o grupo, só ativa o modo
      await sendSuccessReact();
      return sendReply("👑 *DITADURA ATIVADA!* Só você fala! As mensagens dos outros serão apagadas.");
    }

    if (a === "0") {
      delete data[remoteJid];
      setD(data);
      await sendSuccessReact();
      return sendReply("🔓 *DITADURA DESATIVADA!* Todos podem falar novamente.");
    }

    return sendReply(`Use: ${PREFIX}ditadura 1 ou 0`);
  },
};