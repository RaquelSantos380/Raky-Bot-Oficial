import fs from "fs";
import path from "path";

const BRINCADEIRA_FILE = path.resolve("database", "modo-brincadeira.json");
const RPG_FILE = path.resolve("database", "rpg-players.json");

function isModoBrincadeiraAtivo(remoteJid) {
  try {
    if (fs.existsSync(BRINCADEIRA_FILE)) {
      const config = JSON.parse(fs.readFileSync(BRINCADEIRA_FILE, "utf8"));
      return !!config[remoteJid];
    }
  } catch (e) {}
  return false;
}

function lerJogadores() {
  try {
    if (fs.existsSync(RPG_FILE)) return JSON.parse(fs.readFileSync(RPG_FILE, "utf8"));
  } catch (e) {}
  return {};
}

function salvarJogadores(data) {
  fs.writeFileSync(RPG_FILE, JSON.stringify(data, null, 2));
}

import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";

const CLASSES = {
  guerreiro: { emoji: "⚔️", forca: 15, defesa: 10, vida: 100, critico: 10 },
  mago: { emoji: "🧙", forca: 18, defesa: 5, vida: 70, critico: 20 },
  arqueiro: { emoji: "🏹", forca: 12, defesa: 8, vida: 85, critico: 25 },
};

const MONSTROS = [
  { nome: "Slime", emoji: "🟢", vida: 20, forca: 5, xp: 10 },
  { nome: "Esqueleto", emoji: "💀", vida: 35, forca: 10, xp: 25 },
  { nome: "Lobo", emoji: "🐺", vida: 50, forca: 15, xp: 40 },
  { nome: "Orc", emoji: "👹", vida: 70, forca: 20, xp: 60 },
  { nome: "Dragão", emoji: "🐉", vida: 100, forca: 30, xp: 100 },
];

let batalhas = {};

export default {
  name: "rpg",
  description: "RPG de batalha no WhatsApp.",
  commands: ["rpg"],
  usage: `${PREFIX}rpg criar Nome guerreiro\n${PREFIX}rpg status\n${PREFIX}rpg batalha\n${PREFIX}rpg atacar\n${PREFIX}rpg ranking`,

  handle: async ({
    args,
    remoteJid,
    userLid,
    socket,
    sendReply,
    sendErrorReply,
    sendSuccessReact,
  }) => {
    try {
      // Verifica modo brincadeira
      if (isModoBrincadeiraAtivo(remoteJid)) {
        const groupMetadata = await socket.groupMetadata(remoteJid);
        const participant = groupMetadata.participants.find(p => p.id === userLid);
        const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";
        if (!isAdmin) {
          return sendReply("🎮 Apenas ADMINS podem usar este comando!");
        }
      }

      if (!args.length) {
        return sendReply(
          `🎮 *RPG DO GRUPO*\n\n` +
          `📝 *Comandos:*\n` +
          `• ${PREFIX}rpg criar Nome guerreiro\n` +
          `  Classes: ⚔️ guerreiro | 🧙 mago | 🏹 arqueiro\n\n` +
          `• ${PREFIX}rpg status\n` +
          `  Seu status atual\n\n` +
          `• ${PREFIX}rpg perfil @jogador\n` +
          `  Ver perfil de outro jogador\n\n` +
          `• ${PREFIX}rpg batalha\n` +
          `  Iniciar batalha contra monstro\n\n` +
          `• ${PREFIX}rpg atacar\n` +
          `• ${PREFIX}rpg defender\n` +
          `• ${PREFIX}rpg curar\n\n` +
          `• ${PREFIX}rpg ranking\n` +
          `  Ranking dos jogadores`
        );
      }

      const action = args[0].toLowerCase();
      const jogadores = lerJogadores();

      // CRIAR PERSONAGEM
      if (action === "criar" || action === "create") {
        if (jogadores[userLid]) return sendReply("❌ Você já tem um personagem!");

        const tudo = args.slice(1).join(" ");
        const partes = tudo.split("|").map(s => s.trim()).filter(Boolean);
        
        let nome, classe;
        if (partes.length >= 2) {
          nome = partes[0];
          classe = partes[1].toLowerCase();
        } else {
          nome = args[1] || "Aventureiro";
          classe = args[2]?.toLowerCase();
        }

        if (!CLASSES[classe]) {
          return sendReply("❌ Classe inválida! Escolha: guerreiro, mago ou arqueiro");
        }

        jogadores[userLid] = {
          nome,
          classe,
          emoji: CLASSES[classe].emoji,
          nivel: 1,
          xp: 0,
          vidaMax: CLASSES[classe].vida,
          vida: CLASSES[classe].vida,
          forca: CLASSES[classe].forca,
          defesa: CLASSES[classe].defesa,
          critico: CLASSES[classe].critico,
          vitorias: 0,
          derrotas: 0,
        };

        salvarJogadores(jogadores);
        return sendReply(
          `✅ *Personagem criado!*\n\n` +
          `${CLASSES[classe].emoji} ${nome}\n` +
          `⚔️ Classe: ${classe}\n` +
          `❤️ Vida: ${CLASSES[classe].vida}\n` +
          `💪 Força: ${CLASSES[classe].forca}\n` +
          `🛡️ Defesa: ${CLASSES[classe].defesa}\n` +
          `⭐ Nível: 1`
        );
      }

      // VER STATUS
      if (action === "status" || action === "stats") {
        const p = jogadores[userLid];
        if (!p) return sendReply("❌ Você não tem personagem! Use `/rpg criar Nome classe`");

        const xpNecessario = p.nivel * 50;
        return sendReply(
          `${p.emoji} *${p.nome}* (Nível ${p.nivel})\n\n` +
          `❤️ Vida: ${p.vida}/${p.vidaMax}\n` +
          `💪 Força: ${p.forca}\n` +
          `🛡️ Defesa: ${p.defesa}\n` +
          `⭐ XP: ${p.xp}/${xpNecessario}\n` +
          `🏆 Vitórias: ${p.vitorias}\n` +
          `💀 Derrotas: ${p.derrotas}`
        );
      }

      // VER PERFIL
      if (action === "perfil" || action === "profile") {
        const alvoNum = args[1]?.replace(/[^0-9]/g, "");
        if (!alvoNum) return sendReply("Marque alguém! Ex: `/rpg perfil @jogador`");

        const p = jogadores[alvoNum + "@lid"];
        if (!p) return sendReply("❌ Esse jogador não tem personagem!");

        return sendReply(
          `${p.emoji} *${p.nome}* (Nível ${p.nivel})\n\n` +
          `❤️ Vida: ${p.vida}/${p.vidaMax}\n` +
          `💪 Força: ${p.forca}\n` +
          `🛡️ Defesa: ${p.defesa}\n` +
          `🏆 Vitórias: ${p.vitorias}\n` +
          `💀 Derrotas: ${p.derrotas}`
        );
      }

      // BATALHA
      if (action === "batalha" || action === "fight") {
        const p = jogadores[userLid];
        if (!p) return sendReply("❌ Crie um personagem primeiro!");
        if (batalhas[userLid]) return sendReply("❌ Você já está em batalha!");

        const monstro = MONSTROS[Math.floor(Math.random() * MONSTROS.length)];
        batalhas[userLid] = {
          monstro: { ...monstro, vida: monstro.vida },
          curou: false,
        };

        return sendReply(
          `⚔️ *BATALHA INICIADA!*\n\n` +
          `${monstro.emoji} *${monstro.nome}* apareceu!\n` +
          `❤️ Vida: ${monstro.vida}\n` +
          `💪 Força: ${monstro.forca}\n\n` +
          `Comandos: \`/rpg atacar\` | \`/rpg defender\` | \`/rpg curar\``
        );
      }

      // ATACAR
      if (action === "atacar" || action === "attack") {
        const p = jogadores[userLid];
        const b = batalhas[userLid];
        if (!p) return sendReply("❌ Crie um personagem primeiro!");
        if (!b) return sendReply("❌ Inicie uma batalha primeiro!");

        let dano = Math.floor(Math.random() * p.forca) + 5;
        const critico = Math.random() * 100 < p.critico;
        if (critico) dano *= 2;

        b.monstro.vida -= dano;
        let msg = (critico ? "💥 *CRÍTICO!*\n" : "") + `Você causou ${dano} de dano!\n`;

        if (b.monstro.vida <= 0) {
          p.xp += b.monstro.xp;
          p.vitorias++;
          const xpNec = p.nivel * 50;
          if (p.xp >= xpNec) { p.nivel++; p.xp -= xpNec; p.vidaMax += 10; p.vida = p.vidaMax; p.forca += 3; p.defesa += 2; msg += `\n🎉 *VITÓRIA!*\n🆙 *NÍVEL ${p.nivel}!*`; }
          else msg += `\n🎉 *VITÓRIA!* ⭐ +${b.monstro.xp} XP`;
          delete batalhas[userLid];
          salvarJogadores(jogadores);
          return sendReply(msg);
        }

        const danoM = Math.floor(Math.random() * b.monstro.forca) + 2;
        p.vida -= danoM;
        msg += `${b.monstro.emoji} ${b.monstro.nome} causou ${danoM} de dano!\n❤️ Sua vida: ${p.vida}/${p.vidaMax}`;

        if (p.vida <= 0) { p.vida = Math.floor(p.vidaMax / 2); p.derrotas++; delete batalhas[userLid]; msg += `\n\n💀 *DERROTADO!*`; }
        salvarJogadores(jogadores);
        return sendReply(msg);
      }

      // DEFENDER
      if (action === "defender" || action === "defesa") {
        const p = jogadores[userLid];
        const b = batalhas[userLid];
        if (!p) return sendReply("❌ Crie um personagem primeiro!");
        if (!b) return sendReply("❌ Inicie uma batalha primeiro!");

        const danoM = Math.floor(Math.random() * b.monstro.forca) + 2;
        const danoRed = Math.floor(danoM * 0.3);
        p.vida -= danoRed;
        let msg = `🛡️ *DEFESA!* Dano: ${danoM} → ${danoRed}\n❤️ Vida: ${p.vida}/${p.vidaMax}`;
        if (p.vida <= 0) { p.vida = Math.floor(p.vidaMax / 2); p.derrotas++; delete batalhas[userLid]; msg += `\n💀 *DERROTADO!*`; }
        salvarJogadores(jogadores);
        return sendReply(msg);
      }

      // CURAR
      if (action === "curar" || action === "heal") {
        const p = jogadores[userLid];
        const b = batalhas[userLid];
        if (!p) return sendReply("❌ Crie um personagem primeiro!");
        if (!b) return sendReply("❌ Inicie uma batalha primeiro!");
        if (b.curou) return sendReply("❌ Você já curou!");
        b.curou = true;
        p.vida = Math.min(p.vida + 30, p.vidaMax);
        salvarJogadores(jogadores);
        return sendReply(`💚 *CURADO!* +30\n❤️ Vida: ${p.vida}/${p.vidaMax}`);
      }

      // RANKING
      if (action === "ranking" || action === "rank") {
        const lista = Object.entries(jogadores);
        if (lista.length === 0) return sendReply("Nenhum jogador!");
        lista.sort((a, b) => b[1].nivel - a[1].nivel || b[1].xp - a[1].xp);
        let msg = "🏆 *RANKING RPG*\n\n";
        lista.forEach(([lid, p], i) => {
          const m = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}º`;
          msg += `${m} ${p.emoji} *${p.nome}* Nv.${p.nivel}\n`;
        });
        return sendReply(msg);
      }

      throw new InvalidParameterError("Comando inválido! Use `/rpg` para ver o menu.");
    } catch (error) {
      await sendErrorReply(`${error.message}`);
    }
  },
};