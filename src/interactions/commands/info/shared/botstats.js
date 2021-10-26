const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { BotClient } = require("@src/structures");
const { EMOJIS, EMBED_COLORS, SUPPORT_SERVER, DASHBOARD } = require("@root/config");
const { timeformat } = require("@utils/miscUtils");
const os = require("os");
const { outdent } = require("outdent");

/**
 * @param {BotClient} client
 */
module.exports = (client) => {
  // STATS
  const guilds = client.guilds.cache.size;
  const channels = client.channels.cache.size;
  const users = client.guilds.cache.reduce((size, g) => size + g.memberCount, 0);

  // CPU
  const platform = process.platform.replace(/win32/g, "Windows");
  const architecture = os.arch();
  const cores = os.cpus().length;
  const cpuUsage = `${(process.cpuUsage().user / 1024 / 1024).toFixed(2)} MB`;

  // RAM
  const botUsed = `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`;
  const botAvailable = `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`;
  const botUsage = `${((process.memoryUsage().heapUsed / os.totalmem()) * 100).toFixed(1)}%`;

  const overallUsed = `${((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2)} GB`;
  const overallAvailable = `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`;
  const overallUsage = `${Math.floor(((os.totalmem() - os.freemem()) / os.totalmem()) * 100)}%`;

  let desc = "";
  desc = `${desc + EMOJIS.CUBE_BULLET} Total guilds: ${guilds}\n`;
  desc = `${desc + EMOJIS.CUBE_BULLET} Total users: ${users}\n`;
  desc = `${desc + EMOJIS.CUBE_BULLET} Total channels: ${channels}\n`;
  desc = `${desc + EMOJIS.CUBE_BULLET} Websocket Ping: ${client.ws.ping} ms\n`;
  desc += "\n";

  const embed = new MessageEmbed()
    .setTitle("Bot Information")
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(client.user.displayAvatarURL())
    .setDescription(desc)
    .addField(
      "CPU:",
      outdent`
        ${EMOJIS.ARROW} **OS:** ${platform} [${architecture}]
        ${EMOJIS.ARROW} **Cores:** ${cores}
        ${EMOJIS.ARROW} **Usage:** ${cpuUsage}
        `,
      true
    )
    .addField(
      "Bot's RAM:",
      outdent`
        ${EMOJIS.ARROW} **Used:** ${botUsed}
        ${EMOJIS.ARROW} **Available:** ${botAvailable}
        ${EMOJIS.ARROW} **Usage:** ${botUsage}
        `,
      true
    )
    .addField(
      "Overall RAM:",
      outdent`
      ${EMOJIS.ARROW} **Used:** ${overallUsed}
      ${EMOJIS.ARROW} **Available:** ${overallAvailable}
      ${EMOJIS.ARROW} **Usage:** ${overallUsage}
      `,
      true
    )
    .addField("Node Js version", process.versions.node, false)
    .addField("Uptime", "```" + timeformat(process.uptime()) + "```", false);

  // Buttons
  let components = [];
  components.push(new MessageButton().setLabel("Invite Link").setURL(client.getInvite()).setStyle("LINK"));

  if (SUPPORT_SERVER) {
    components.push(new MessageButton().setLabel("Support Server").setURL(SUPPORT_SERVER).setStyle("LINK"));
  }

  if (DASHBOARD.enabled) {
    components.push(new MessageButton().setLabel("Dashboard Link").setURL(DASHBOARD.baseURL).setStyle("LINK"));
  }

  let buttonsRow = new MessageActionRow().addComponents(components);

  return { embeds: [embed], components: [buttonsRow] };
};
