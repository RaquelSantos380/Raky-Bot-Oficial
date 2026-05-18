import { errorLog } from "../utils/logger.js";

const raquelLid = "556292900737@lid";
const adminCache = {};

export async function protegerRaquel(socket, remoteJid) {
  try {
    const groupMetadata = await socket.groupMetadata(remoteJid);
    const raquel = groupMetadata.participants.find(p => p.id === raquelLid);
    if (!raquel) return;

    const isAdmin = raquel.admin === "admin" || raquel.admin === "superadmin";

    // Se era admin e não é mais, recoloca
    if (adminCache[remoteJid] === true && !isAdmin) {
      await socket.groupParticipantsUpdate(remoteJid, [raquelLid], "promote");
      console.log(`🛡️ Raquel perdeu admin e foi recolocada!`);
    }

    adminCache[remoteJid] = isAdmin;
  } catch (e) {
    errorLog(`Erro ao proteger Raquel: ${e.message}`);
  }
}