import { errorLog } from "../utils/logger.js";

// Cache para verificar se Raquel era admin antes
const adminCache = {};

export async function protegerRaquel(socket, remoteJid, action, data) {
  const raquelLid = "556292900737@lid";

  try {
    // Quando alguém entra ou há mudança no grupo, verifica o status da Raquel
    const groupMetadata = await socket.groupMetadata(remoteJid);
    const raquel = groupMetadata.participants.find(p => p.id === raquelLid);

    if (!raquel) return; // Raquel não está no grupo

    const isAdmin = raquel.admin === "admin" || raquel.admin === "superadmin";

    // Se Raquel era admin e não é mais, recoloca
    if (adminCache[remoteJid] === true && !isAdmin) {
      await socket.groupParticipantsUpdate(remoteJid, [raquelLid], "promote");
      console.log(`🛡️ Raquel foi removida de admin e recolocada automaticamente!`);
    }

    // Atualiza cache
    adminCache[remoteJid] = isAdmin;
  } catch (e) {
    errorLog(`Erro ao proteger Raquel: ${e.message}`);
  }
}