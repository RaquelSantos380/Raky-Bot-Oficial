/**
 * Menu do bot
 *
 * @author Dev Gui
 */
import { readFileSync } from "fs";
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf-8"));
import { BOT_NAME } from "./config.js";
import { getPrefix } from "./utils/database.js";
import { readMore } from "./utils/index.js";
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

export function menuMessage(groupJid) {
  const date = new Date();
  const prefix = getPrefix(groupJid);
  const modoBrincadeira = isModoBrincadeiraAtivo(groupJid);

  let menu = `╭━━⪩ ${BOT_NAME} ⪨━━${readMore()}
▢
▢ • Data: ${date.toLocaleDateString("pt-br")}
▢ • Hora: ${date.toLocaleTimeString("pt-br")}
▢ • Prefixo: ${prefix}
▢ • Versão: ${pkg.version}
▢
╰━━─「🪐」─━━

╭━━⪩ DONO ⪨━━
▢
▢ • ${prefix}set-prefix
▢ • ${prefix}set-menu-image
▢ • ${prefix}off
▢ • ${prefix}on
▢
╰━━─「👑」─━━

╭━━⪩ ADMIN ⪨━━
▢
▢ • ${prefix}welcome (1/0)
▢ • ${prefix}set-welcome
▢ • ${prefix}agendar-grupo
▢ • ${prefix}modobrincadeira (1/0)
▢ • ${prefix}abrir
▢ • ${prefix}fechar
▢ • ${prefix}ban
▢ • ${prefix}mute
▢ • ${prefix}unmute
▢ • ${prefix}delete
▢ • ${prefix}limpar
▢ • ${prefix}hidetag
▢ • ${prefix}promover
▢ • ${prefix}rebaixar
▢ • ${prefix}revelar
▢ • ${prefix}link-grupo
▢ • ${prefix}exit (1/0)
▢ • ${prefix}anti-link (1/0)
▢ • ${prefix}anti-link-warn (1/0)
▢ • ${prefix}anti-flood (1/0)
▢ • ${prefix}bloquear-palavra
▢ • ${prefix}lista-negra
▢ • ${prefix}only-admin (1/0)
▢ • ${prefix}links add/remove/list
▢ • ${prefix}avisos
▢ • ${prefix}avisos reset @user
▢
╰━━─「⚙️」─━━

╭━━⪩ MEMBROS ⪨━━
▢
▢ • ${prefix}menu
▢ • ${prefix}ping
▢ • ${prefix}info
▢ • ${prefix}perfil
▢ • ${prefix}meu-lid
▢ • ${prefix}sticker
▢ • ${prefix}to-image
▢ • ${prefix}to-gif
▢ • ${prefix}to-mp3
▢ • ${prefix}attp
▢ • ${prefix}ttp
▢ • ${prefix}rename
▢ • ${prefix}fake-chat
▢ • ${prefix}suporte
▢ • ${prefix}adms — Chamar administradores
▢ • ${prefix}conselho — Conselho do dia 💡
▢ • ${prefix}conselho | amoroso
▢ • ${prefix}conselho | financeiro
▢ • ${prefix}conselho | vida
▢
╰━━─「👥」─━━`;

  if (modoBrincadeira) {
    menu += `\n\n╭━━⪩ DIVERSÃO ⪨━━\n▢\n▢ 🎮 *Modo Brincadeira ATIVO!*\n▢ Apenas ADMINS podem usar\n▢ os comandos de diversão.\n▢\n╰━━─「🔒」─━━`;
  } else {
    menu += `\n\n╭━━⪩ DIVERSÃO ⪨━━
▢
▢ • ${prefix}abracar @user
▢ • ${prefix}beijar @user
▢ • ${prefix}dado
▢ • ${prefix}jantar @user
▢ • ${prefix}lutar @user
▢ • ${prefix}matar @user
▢ • ${prefix}socar @user
▢ • ${prefix}velha — Jogo da Velha
▢ • ${prefix}forca — Jogo da Forca
▢ • ${prefix}animal — Acerte o Animal
▢ • ${prefix}ship @user1 @user2 — Casal 💘
▢ • ${prefix}defeitos @user — Defeitos 😂
▢ • ${prefix}pensao @user — Pensão 😂
▢ • ${prefix}previsao @user — Futuro 🔮
▢ • ${prefix}chances | algo — Chances 🎲
▢ • ${prefix}feitico @user — Feitiço 🪄
▢
╰━━─「🎡」─━━

╭━━⪩ 🎲 RPG ⪨━━
▢
▢ • ${prefix}rpg criar | Nome | classe
▢ • ${prefix}rpg status
▢ • ${prefix}rpg perfil | @jogador
▢ • ${prefix}rpg batalha
▢ • ${prefix}rpg atacar
▢ • ${prefix}rpg defender
▢ • ${prefix}rpg curar
▢ • ${prefix}rpg ranking
▢
╰━━─「⚔️」─━━`;
  }

  menu += `\n\n⚠️ Use | para separar os argumentos!`;

  return menu;
}
