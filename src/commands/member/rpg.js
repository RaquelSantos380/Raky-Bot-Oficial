import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import fs from "fs";
import path from "path";

const RPG_FILE = path.resolve("database", "rpg-players.json");

function lerJogadores() {
  try {
    if (fs.existsSync(RPG_FILE)) return JSON.parse(fs.readFileSync(RPG_FILE, "utf8"));
  } catch (e) {}
  return {};
}

function salvarJogadores(data) {
  fs.writeFileSync(RPG_FILE, JSON.stringify(data, null, 2));
}

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

function pegarAlvo(args) {
  // Junta todos os args e separa por |
  const tudo = args.join(" ");
  const partes = tudo.split("|").map(s => s.trim()).filter(Boolean);
  
  // Se tem @ na primeira parte, é o alvo
  if (partes[0]?.includes("@")) {
    return {
      alvo: partes[0].replace(/[^0-9]/g, ""),
      resto: partes.slice(1)
    };
  }
  
  // Se não, procura @ nos args
  for (const arg of args) {
    if (arg.includes("@")) {
      return {
        alvo: arg.replace(/[^0-9]/g, ""),
        resto: args.filter(a => a !== arg)
      };
    }
  }
  
  return { alvo: null, resto: args };
}

export default {
  name: "rpg",
  description: "RPG de batalha no WhatsApp.",
  commands: ["rpg"],
  usage: `${PREFIX}rpg criar Nome guerreiro\n${PREFIX}rpg status\n${PREFIX}rpg batalha\n${PREFIX}rpg atacar\n${PREFIX}rpg ranking`,

  handle: async ({
    args,
    remoteJid,
    userLid,
    sendReply,
    sendErrorReply,
    sendSuccessReact,
  }) => {
    try {
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

        // Junta args e separa por |
        const tudo = args.slice(1).join(" ");
        const partes = tudo.split("|").map(s => s.trim()).filter(Boolean);
        
        // Se não tem |, usa os args direto
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

      // VER PERFIL DE OUTRO
      if (action === "perfil" || action === "profile") {
        const { alvo } = pegarAlvo(args.slice(1));
        if (!alvo) return sendReply("Marque alguém! Ex: `/rpg perfil @jogador`");

        const alvoLid = alvo + "@lid";
        const p = jogadores[alvoLid];
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

      // INICIAR BATALHA
      if (action === "batalha" || action === "fight") {
        const p = jogadores[userLid];
        if (!p) return sendReply("❌ Crie um personagem primeiro!");
        if (batalhas[userLid]) return sendReply("❌ Você já está em batalha!");

        const monstro = MONSTROS[Math.floor(Math.random() * MONSTROS.length)];
        batalhas[userLid] = {
          monstro: { ...monstro, vida: monstro.vida },
          defesaAtiva: false,
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

        b.defesaAtiva = false;

        let danoJogador = Math.floor(Math.random() * p.forca) + 5;
        const critico = Math.random() * 100 < p.critico;
        if (critico) danoJogador *= 2;

        b.monstro.vida -= danoJogador;

        let msg = critico ? `💥 *CRÍTICO!*\n` : "";
        msg += `Você causou ${danoJogador} de dano!\n`;

        if (b.monstro.vida <= 0) {
          const xpGanho = b.monstro.xp;
          p.xp += xpGanho;
          p.vitorias++;

          const xpNecessario = p.nivel * 50;
          if (p.xp >= xpNecessario) {
            p.nivel++;
            p.xp -= xpNecessario;
            p.vidaMax += 10;
            p.vida = p.vidaMax;
            p.forca += 3;
            p.defesa += 2;
            msg += `\n🎉 *VITÓRIA!*\n⭐ +${xpGanho} XP\n🆙 *UPOU PARA NÍVEL ${p.nivel}!*`;
          } else {
            msg += `\n🎉 *VITÓRIA!*\n⭐ +${xpGanho} XP`;
          }

          delete batalhas[userLid];
          salvarJogadores(jogadores);
          return sendReply(msg);
        }

        const danoMonstro = Math.floor(Math.random() * b.monstro.forca) + 2;
        p.vida -= danoMonstro;

        msg += `${b.monstro.emoji} ${b.monstro.nome} causou ${danoMonstro} de dano!\n`;
        msg += `\n❤️ Sua vida: ${p.vida}/${p.vidaMax}\n`;
        msg += `${b.monstro.emoji} Vida do monstro: ${b.monstro.vida}`;

        if (p.vida <= 0) {
          p.vida = Math.floor(p.vidaMax / 2);
          p.derrotas++;
          delete batalhas[userLid];
          msg += `\n\n💀 *VOCÊ FOI DERROTADO!*\nSua vida foi restaurada pela metade.`;
        }

        salvarJogadores(jogadores);
        return sendReply(msg);
      }

      // DEFENDER
      if (action === "defender" || action === "defesa") {
        const p = jogadores[userLid];
        const b = batalhas[userLid];
        if (!p) return sendReply("❌ Crie um personagem primeiro!");
        if (!b) return sendReply("❌ Inicie uma batalha primeiro!");

        b.defesaAtiva = true;

        const danoMonstro = Math.floor(Math.random() * b.monstro.forca) + 2;
        const danoReduzido = Math.floor(danoMonstro * 0.3);
        p.vida -= danoReduzido;

        let msg = `🛡️ *DEFESA ATIVADA!*\n`;
        msg += `Dano reduzido: ${danoMonstro} → ${danoReduzido}\n`;
        msg += `\n❤️ Sua vida: ${p.vida}/${p.vidaMax}`;

        if (p.vida <= 0) {
          p.vida = Math.floor(p.vidaMax / 2);
          p.derrotas++;
          delete batalhas[userLid];
          msg += `\n\n💀 *VOCÊ FOI DERROTADO!*`;
        }

        salvarJogadores(jogadores);
        return sendReply(msg);
      }

      // CURAR
      if (action === "curar" || action === "heal") {
        const p = jogadores[userLid];
        const b = batalhas[userLid];
        if (!p) return sendReply("❌ Crie um personagem primeiro!");
        if (!b) return sendReply("❌ Inicie uma batalha primeiro!");
        if (b.curou) return sendReply("❌ Você já curou nessa batalha!");

        b.curou = true;
        const cura = 30;
        p.vida = Math.min(p.vida + cura, p.vidaMax);

        salvarJogadores(jogadores);
        return sendReply(`💚 *CURADO!*\n+${cura} de vida\n❤️ Sua vida: ${p.vida}/${p.vidaMax}`);
      }

      // RANKING
      if (action === "ranking" || action === "rank") {
        const lista = Object.entries(jogadores);
        if (lista.length === 0) return sendReply("Nenhum jogador ainda!");

        lista.sort((a, b) => b[1].nivel - a[1].nivel || b[1].xp - a[1].xp);

        let msg = "🏆 *RANKING RPG*\n\n";
        lista.forEach(([lid, p], i) => {
          const medalha = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}º`;
          msg += `${medalha} ${p.emoji} *${p.nome}* - Nv.${p.nivel} (${p.vitorias}🏆)\n`;
        });

        return sendReply(msg);
      }

      throw new InvalidParameterError("Comando inválido! Use `/rpg` para ver o menu.");
    } catch (error) {
      await sendErrorReply(`${error.message}`);
    }
  },
};
