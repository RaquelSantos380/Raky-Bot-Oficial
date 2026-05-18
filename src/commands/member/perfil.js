import fs from "fs";
import path from "path";

const BRINCADEIRA_FILE = path.resolve("database", "modo-brincadeira.json");

function isModoBrincadeiraAtivo(remoteJid) {
  try {
    if (fs.existsSync(BRINCADEIRA_FILE)) {
      const config = JSON.parse(fs.readFileSync(BRINCADEIRA_FILE, "utf8"));
      return !!config[remoteJid];
    }
  } catch (e) {}
  return false;
}

import { ASSETS_DIR, PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { getProfileImageData } from "../../services/baileys.js";
import { isGroup, onlyNumbers } from "../../utils/index.js";
import { errorLog } from "../../utils/logger.js";

export default {
  name: "perfil",
  description: "Mostra informações de um usuário",
  commands: ["perfil", "profile"],
  usage: `${PREFIX}perfil ou perfil @usuario`,
  handle: async ({
    args,
    socket,
    remoteJid,
    userLid,
    sendErrorReply,
    sendWaitReply,
    sendSuccessReact,
    sendReply,
  }) => {
    try {
      // Verifica modo brincadeira
      if (isModoBrincadeiraAtivo(remoteJid)) {
        const groupMetadata2 = await socket.groupMetadata(remoteJid);
        const participant2 = groupMetadata2.participants.find(p => p.id === userLid);
        const isAdmin2 = participant2?.admin === "admin" || participant2?.admin === "superadmin";
        if (!isAdmin2) {
          return sendReply("🎮 Apenas ADMINS podem usar este comando!");
        }
      }

      if (!isGroup(remoteJid)) {
        throw new InvalidParameterError("Este comando só pode ser usado em grupo.");
      }

      const targetLid = args[0] ? `${onlyNumbers(args[0])}@lid` : userLid;

      await sendWaitReply("Carregando perfil...");

      try {
        let profilePicUrl;
        let userRole = "Membro";

        try {
          const { profileImage } = await getProfileImageData(socket, targetLid);
          profilePicUrl = profileImage || `${ASSETS_DIR}/images/default-user.png`;
        } catch (error) {
          errorLog(`Erro ao tentar pegar dados do usuário ${targetLid}: ${JSON.stringify(error, null, 2)}`);
          profilePicUrl = `${ASSETS_DIR}/images/default-user.png`;
        }

        const groupMetadata = await socket.groupMetadata(remoteJid);
        const participant = groupMetadata.participants.find((p) => p.id === targetLid);
        if (participant?.admin) { userRole = "Administrador"; }

        const randomPercent = Math.floor(Math.random() * 100);
        const programPrice = (Math.random() * 5000 + 1000).toFixed(2);
        const beautyLevel = Math.floor(Math.random() * 100) + 1;

        const mensagem = `👤 *Nome:* @${targetLid.split("@")[0]}
🎖️ *Cargo:* ${userRole}

🌚 *Programa:* R$ ${programPrice}
🐮 *Gado:* ${randomPercent + 7 || 5}%
🎱 *Passiva:* ${randomPercent + 5 || 10}%
✨ *Beleza:* ${beautyLevel}%`;

        await sendSuccessReact();
        await socket.sendMessage(remoteJid, {
          image: { url: profilePicUrl },
          caption: mensagem,
          mentions: [targetLid],
        });
      } catch (error) {
        console.error(error);
        sendErrorReply("Ocorreu um erro ao tentar verificar o perfil.");
      }
    } catch (error) {
      await sendErrorReply(`${error.message}`);
    }
  },
};