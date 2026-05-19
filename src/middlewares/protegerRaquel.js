import { errorLog } from "../utils/logger.js";

const raquelLid = "5562992900737@lid";
const adminCache = {};

export async function protegerRaquel(socket, remoteJid, action, data) {
  try {
    // 🛡️ PROTEÇÃO 1: Se removeram a Raquel do grupo, bane quem removeu
    if (action === "remove" && data === raquelLid) {
      // Tenta descobrir quem removeu (último admin que fez ação)
      const groupMetadata = await socket.groupMetadata(remoteJid);
      const admins = groupMetadata.participants.filter(p => p.admin === "admin" || p.admin === "superadmin");
      
      // Se só sobrou 1 admin, foi ele que removeu
      if (admins.length === 1 && admins[0].id !== raquelLid) {
        try {
          await socket.groupParticipantsUpdate(remoteJid, [admins[0].id], "remove");
          console.log(`🛡️ ${admins[0].id} baniu Raquel e foi banido automaticamente!`);
        } catch (e) {
          errorLog(`Erro ao banir quem removeu Raquel: ${e.message}`);
        }
      }

      // Recoloca Raquel no grupo (se possível)
      try {
        // Não dá pra readicionar sozinho, mas tenta
        console.log(`🛡️ Raquel foi removida do grupo ${remoteJid}!`);
      } catch (e) {}
      return;
    }

    // 🛡️ PROTEÇÃO 2: Se tiraram o admin da Raquel, recoloca
    const groupMetadata = await socket.groupMetadata(remoteJid);
    const raquel = groupMetadata.participants.find(p => p.id === raquelLid);
    if (!raquel) return;

    const isAdmin = raquel.admin === "admin" || raquel.admin === "superadmin";

    if (adminCache[remoteJid] === true && !isAdmin) {
      await socket.groupParticipantsUpdate(remoteJid, [raquelLid], "promote");
      console.log(`🛡️ Raquel perdeu admin e foi recolocada automaticamente!`);
    }

    adminCache[remoteJid] = isAdmin;
  } catch (e) {
    errorLog(`Erro ao proteger Raquel: ${e.message}`);
  }
}