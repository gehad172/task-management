import bcrypt from "bcryptjs";
import { ActivityEntry } from "../models/ActivityEntry.js";
import { Board } from "../models/Board.js";
import { Task } from "../models/Task.js";
import { User } from "../models/User.js";

const SEED_EMAIL = "editor@kanban.local";

async function ensureSeedUser() {
  let user = await User.findOne({ email: SEED_EMAIL });
  if (user) return user;
  const passwordHash = await bcrypt.hash(process.env.SEED_USER_PASSWORD ?? "editor123", 10);
  user = await User.create({
    name: "Editor",
    email: SEED_EMAIL,
    password: passwordHash,
  });
  return user;
}

export async function seedDatabase() {
  const user = await ensureSeedUser();
  const ownerId = user._id;

  const count = await Board.countDocuments();
  if (count > 0) return;

  await Board.create({
    title: "September Editorial Board",
    description: "Curating the winter collection campaign",
    subtitle: "Curating the winter collection campaign",
    type: "Kanban Board",
    privacy: "Team Only",
    owner: ownerId,
    statusLabel: "Active",
    statusTone: "active",
    iconKey: "book",
    memberAvatars: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBdt8zX79T0h850crk0wWB-xw3sEEF6uiBJbnwT1q-gWhJ0gcNY3iUD7_ww26pZZI4vRRq8B9Ps8FUl84lcVcP2T1ztYuGlabYOYvVsjpw3zDotYFIrisuj8v-YhHCPCf18u3eSVKEnHXWw6_FNj54janRBo85k4jZMLEUicBxfjp7BjV3ihj5H0xWUbRWirQ_qUB1qPSPJiRjcZyAElU-N1u5rmZRTI-fWJoub-GgZmPkE3lx_Ef-JK_XRVG-vmY4m88QTBKPVb33j",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAkOELB-2-T34glp2xg6DxsNc-TFUjBKGrQxFrp6YDuKhz9WO7yBJM2RBTvJXlfiMlcaVJ8Q8ObByNp8LbWM7mmqGmcRCRtTRXNmrdpllZGRgQ8wlTXqPjBxfjLZ8zY7x57wohSl9ZbY6rDIsTEcaS_EgAkb2qOxLLYI-kR1B_yo6zNQTsKSo4auadb-70PKB82MT4XdEJbUHtGkkFe-bvTfrOBeaAKcT-UAoWxXmVW-zcdx8EFiOAsy4p1JVZqvJ7Gl80iv0JQRZxl",
    ],
    meta: { kind: "tasks", primary: "24/40" },
    headerAvatars: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAUebFTUhq2p_Fp7REB_xg9uFci0p6nQX-NZiV8hoC9tJ_FzZNv7O1JT9FdjzZ9GCcteMvr2dQFQ_upQbQAFUuEfEL3afpteEf4vTOzUCL-RUpoKqU2yKx3edfo1zC-EfqiKm3LpOXD-8eB2DeVgm-PBXJafyqRZACusNqzymOuID-GWP9eg9Od_Z6lGA7yy1_k9EnTGy4LtOVb63mMtEPjuvRVl1SAGWhA0vFfw_MbqrUJyshqcrm4KEKawmztAUkpJQz-YSZoj-qd",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCg0-lRThK6ogyMtJFXim2IKu_gKUlikfe_43sNm6GvuBHkJESnclvV4G9R2uSF6Whe1RWo1xteP_OAQtwbC6bm7G6tVBlEKYXePhW0Ua9qUma_cuhMZ3gfoTaJyOetUjJW0TfbSJGlvW1GNtkuQdivGbHmE3taRCpGaNbxniogkov25RHr1AsL0x4-ee5pYznCCcGyGFit1qYRiRvxMHI_LOeUVqF0Bv4BRaBVOAPkyszVMdLK-SulRfGSVTyDyqvs-XkkotPbO8vW",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBUrQ_DvR6LRPZa2BMCSTNbvAOZpJmCQF5NdVGD9TgEVNsZDu1rDcqk0CPllKt7FG-yZqSmqfVyGm66rnVMigZs3Jyh_L1QCaGpfXmbNE0vpVNv4UdQImdAH7aSjr3v2E5sEsbqnLnuaOLFTqbYGp_-lCUxtTzIUMIDNWvo4e9wl-mQAv4DuBAZSFkob4PHM0s1TjD6B3dlYXM5EN1xhY8TkkY8JXY22rloZSw5HMXdlX7A24Uu6lCQlAuGCDICqauwpSuc0my651ge",
    ],
    headerOverflowLabel: "+5",
  });

  await Board.insertMany([
    {
      title: "Summer Anthology 2024",
      description:
        "Coordination of long-form essays, poetry submissions, and seasonal photography curation for the print edition.",
      type: "Kanban Board",
      privacy: "Team Only",
      owner: ownerId,
      statusLabel: "Active",
      statusTone: "active",
      iconKey: "book",
      memberAvatars: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBdt8zX79T0h850crk0wWB-xw3sEEF6uiBJbnwT1q-gWhJ0gcNY3iUD7_ww26pZZI4vRRq8B9Ps8FUl84lcVcP2T1ztYuGlabYOYvVsjpw3zDotYFIrisuj8v-YhHCPCf18u3eSVKEnHXWw6_FNj54janRBo85k4jZMLEUicBxfjp7BjV3ihj5H0xWUbRWirQ_qUB1qPSPJiRjcZyAElU-N1u5rmZRTI-fWJoub-GgZmPkE3lx_Ef-JK_XRVG-vmY4m88QTBKPVb33j",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAkOELB-2-T34glp2xg6DxsNc-TFUjBKGrQxFrp6YDuKhz9WO7yBJM2RBTvJXlfiMlcaVJ8Q8ObByNp8LbWM7mmqGmcRCRtTRXNmrdpllZGRgQ8wlTXqPjBxfjLZ8zY7x57wohSl9ZbY6rDIsTEcaS_EgAkb2qOxLLYI-kR1B_yo6zNQTsKSo4auadb-70PKB82MT4XdEJbUHtGkkFe-bvTfrOBeaAKcT-UAoWxXmVW-zcdx8EFiOAsy4p1JVZqvJ7Gl80iv0JQRZxl",
      ],
      meta: { kind: "tasks", primary: "24/40" },
      subtitle: "",
      headerAvatars: [],
      headerOverflowLabel: "+0",
    },
    {
      title: "Brand Identity Refresh",
      description:
        "Visual guidelines, typography system audit, and social media template redesign for the upcoming quarter.",
      type: "Kanban Board",
      privacy: "Team Only",
      owner: ownerId,
      statusLabel: "Planning",
      statusTone: "planning",
      iconKey: "megaphone",
      memberAvatars: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAolQ_MThZ9VU_PPz2hc8I-B6LVrDmGZxTfMW6U3GVfrO4MC94Se8rNVqIlpF9DwFdwxQVhTIYJQsQ3Tj3ncHpgdWKwSqGFefJxtAE-Hu61boE3HPdYnu9jBdxMCHABVy8wIkF4NhNKNofkL_N6u_QtwVWCrAXua7w63ry66E2GQqo6pNz-1cYsrbJVzRU4Xrw-m2TILV0ALKnfiZytqF0cGWn0lj3LVrHmqQBIUw-0g8yfq0Mmqa1baoecZSmDsOg4L8KHOzkNaX4n",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCxcevoL0oSJpk5kY2zpJZXu-jjqOZG3sVg9XPe7YBU0zBVbsOfEtCI_aKOUMQIuOiXYY16gl4TspZUiMu-GO-x0Qm_1np7QduN1ATRpJ0zRNUu_QbkkHB5rKJI6bEXSK3ZLqH5BGEsmyAI-48kxUyWA14-7n-tpLAHoEYISMuCs4MG8_YPKMdlvCUYWJP6otYZJ29ZxDjpd1OA_DlwXE6Ndu-2sJOqm74QuOvEx2E9-UVOG44zavdNtfCWyKYOJ0ohO0LBXgqa1UGB",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCY2YboqiPHJYFVxjH7kbcj1y01YEJIwRn0u-Rf3MXAMbwxjbrVbe7H7U9sJP56uyDPrly7ynYrQQOh2UKERFynX03ug8guCPY39DdD2u_u19aSjaWYv-YOdp8B1kBwcso1ii44yRSd2wZiro1ENAprqtRUzu_zsv8vN_rEp_tQD9UTJf9NjR_bJZe56FKG279W4j4TVHGemFdy6VeETQZaRk56RhNJsBClsmfPLmRKISUPDHb5P23A-_BiPCjHJJ5GF3qfNcSMq6B1",
      ],
      meta: { kind: "critical", primary: "Critical" },
      subtitle: "",
      headerAvatars: [],
      headerOverflowLabel: "+0",
    },
    {
      title: "Podcast: The Creative Core",
      description:
        "Scripting and post-production schedule for Season 4 interviews with industry-leading designers and editors.",
      type: "Kanban Board",
      privacy: "Team Only",
      owner: ownerId,
      statusLabel: "Active",
      statusTone: "active",
      iconKey: "mic",
      memberAvatars: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBTAFQ7zQiLL77HguY7AZ_bRSn2PtzN2p6EBQXxsQRxNzj5GLlY56SxcKSTUJ7JYSy7MWUjt-qKCfM7LlsQou8zA4RsbLrwMsMxDOs0RKU6nlHKErXk_43jullgGzn-nHEn_jWH6HMSmloj0YC7EdnFe971HsSB_5oCilgRZ3DDGj0aS20RCCtfme1A1rdN1m3umIf3_egt0tA_e0EJIqDDPoG3aTmmmrL43KJ0Kw7HSgWVHu-0BPZN8y4Etl-9OUVwFZVEmHF6kiin",
      ],
      meta: { kind: "schedule", primary: "Next: Tue" },
      subtitle: "",
      headerAvatars: [],
      headerOverflowLabel: "+0",
    },
    {
      title: "Weekly Newsletter Flow",
      description:
        "Automation of content ingestion and layout drafting for our 50k+ subscriber weekly editorial digest.",
      type: "Kanban Board",
      privacy: "Team Only",
      owner: ownerId,
      statusLabel: "Completed",
      statusTone: "completed",
      iconKey: "newspaper",
      memberAvatars: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDzcwtTJqt2PYwVAx15rspCXd-1qBpbzglx3AOhbkRnizQn87vFfyiT7y7PFa5LWF17NOdV1LUhuQ2X-ZsxhyCV_IILay86H9LqM_ud-Ym1Tk02pBr5u-_1llz0tnASgRdaHJkT3LRAKuCIQCguHqSt1HR8kTywsQHpz47XhAbImtfLVk7kG3bfvSOc80byylZrSNrGZffXlJZw7uBRW45D1WkeeftnWdSJahCqo4ib-DKfROKA_ByhJNfwhMWAnmONDUnKrP7K9vyT",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDfdN7X2L2cgsmYK5_3UcpDtc3SQU1POJoqsSdgSe4ioQvBFRzl6NFODCZg-JRf9vig9KL6b2p1CVrxhTkumVJu7IlcO-IZ1TZCH4EdS4vcznngAudUxAUUv82KacEMCUiRTjCLfQrld_0cGP7GGSamMveerFDPi5fhV0VNAOwEAMq3K754enQ-JjMD0IdPzolpcJEOxdItf3cHFrOmBGLqqlkkm0KDAfU9IFZVTV2Voz7imsbhYfulKwdbDCR8MtKFiJNZ4r-urQPR",
      ],
      meta: { kind: "archive", primary: "Archive Ready" },
      subtitle: "",
      headerAvatars: [],
      headerOverflowLabel: "+0",
    },
  ]);

  const main = await Board.findOne({ title: "September Editorial Board" });
  if (!main) return;

  await Task.insertMany([
    {
      boardId: main._id,
      title: "Winter Lookbook Photography Concepts",
      description:
        "Develop mood boards for the upcoming outdoor mountain shoot across 4 locations.",
      status: "todo",
      priority: "high",
      commentsCount: 12,
      attachmentsCount: 4,
      assigneeAvatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCnHQ-6zjXuY0uZS_GH5UnbDNljT7YIqZ-E4I6ivsK_qtsr3ATBSmx8QzAuq7mkkdaX_suCTsijspwVw-y6HQ2JP_APj4a2ZFxbZE0E2kTOhN0_WbNm_0NcR70m9FQhLG3_ZQz7sktp5mwiEipX6nfk5e_7dz3FnMmHmfOklsrsXIiZ7flCDBrHTkndvyivuOW9mTpaXqpuaEtvZTVkkeRwvEMIGqgIbj80Wad7qoSJekR5T6_7LZ8lp314d2w8xTrQXVgzv_SpaeCd",
    },
    {
      boardId: main._id,
      title: "Social Media Asset Batching",
      status: "todo",
      priority: "medium",
      dueLabel: "Sept 28",
      assigneeAvatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCLUpCPsCMehgn8LJMizOCPTjMDkRSSffsHZHpK3xHCDcUAsY6lLsmROfZ4qEPk4nbOTnryJdM501lOH-JocI6UBhYVmIrQHyxF_oH4hmcIvHCkvMBLicgz6ifPfjCnbQUhQnMTt9zz2M674KqpBjwmtkw8Iz5Lr6gxq7OP1IT6IKrK9Hzqiw5OPat3pBSyWTstYd_h5lLeyHX4vb8JcR2mrkkXFFdOQ7NNeuq83lx1F7P_UoZUCwWc5qSe_4fURF26l-4feWC2STTx",
    },
    {
      boardId: main._id,
      title: "E-commerce UI Refresh",
      status: "in_progress",
      priority: "high",
      progress: 2 / 3,
      scheduleLabel: "2 days left",
      highlighted: true,
      assigneeAvatars: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCudDnc_kK4pnM2gN_RRIZhRtz6z1UQicsmCkqcz0jEh_6QiJ38vHCPdrQkAdFmQHO3_QSJGP2_EYH7XukESNlySZ4pKLwP2j8f59Tfmmpq9N2elr9uy-Vipr0FD-Y6Z4dxfww6XFQMGBENPz4Wv7xPegIzapV_Pmp4FfMIEPEO64lhAEkVjE-OU8pUU1JoTWAa_qsskZamJaTqVViXAHfYErPJtILBG_0qtHYtvNgw56sIXbcei29Xk0eUp5TTEPNa_4WpUiDueRNI",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBw6ehEFjhuH3tldKTmQojZXB4GdKDouHrXrY6G_ohaAL2vxss0Jl1toII7is5dgUe1jEEuy_S6pgf-jy8zuyHbic-xtE7u_eqg--X5kihhqwqfHzYafQu0ryH91TDmAGeuilQa4zV5PnEEng7Izj3G_xazE7YBlPnsmZogrQCWbyfAKYs0Jem9ODncEOMT4BhCdz9CY-9JDFQTGQ4JADwBUnooY1EC8Y8qTZvLQp3_N4CBlnDCrQ99ZwgL-ZDSb2TJJ7OBTLBKYP3e",
      ],
    },
    {
      boardId: main._id,
      title: "Newsletter Template Audit",
      status: "done",
      priority: "low",
      completed: true,
    },
  ]);

  await ActivityEntry.insertMany([
    {
      boardId: main._id,
      kind: "user",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBXc_RhMgYbtaI7vAzpuK72jkBIFLeAcwnXBBpbBlJqr5D0O9APg_W1MktjyJDu3dagxH4oEe_j4Z5HlCBEgoZrNjvwBjUdAweCEvDlJw5dpWSycUYVDcD0xxq-sf0BMriuwbhPr-0Q6n7_kCOwTy3Ll9DRdJEkdrN5xmGfFZ1w_fkNt02RhRZ_AZwVXxgLzpKX6ljEpU39G4IfxABoglnkvfovIyzfhf6JLENxGptmXoqWuBplytCoaT-aKi78bvyHzuw-x0-lWU7s",
      time: "14 mins ago",
      showConnector: true,
      segments: [
        { type: "bold", value: "David Chen" },
        { type: "text", value: " moved " },
        { type: "primary", value: "Winter Lookbook" },
        { type: "text", value: " to " },
        { type: "bold", value: "To Do" },
      ],
    },
    {
      boardId: main._id,
      kind: "user",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAaCF2zSt8n29Nt1_bv_N86_mipva3cTJHvXevmkp8V4SI49nM7xLon7gheiwJDuyfJjI_mP1TvX0jzRzUqzNw6Z6Lv9vDYr4-AxraKcEMSgJ8uE7ALVMcPvNBZH7DyFdGctcVPKiw6iToPwQXDSjjK_jYNs2MqS7Zt0fuhWKBaKBGuChHce0FedXK78A2hYoKWhUL-Z7FQUjwNFQCcRgsKVhuhzWIS-2C4136ibRD9Mz16IhQxoHUhcmZVcEJkpLUn7RfyubmbHJuL",
      time: "2 hours ago",
      showConnector: true,
      segments: [
        { type: "bold", value: "Sarah Miller" },
        { type: "text", value: " added " },
        { type: "primary", value: "Batching Assets" },
      ],
    },
    {
      boardId: main._id,
      kind: "system",
      time: "5 hours ago",
      segments: [
        { type: "text", value: "Board updated by " },
        { type: "italic", value: "Editorial AI" },
      ],
    },
  ]);

  console.log("Database seeded with user, boards, tasks, and activity.");
}
