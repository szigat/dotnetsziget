export const SITE = {
  website: "https://dotnetsziget.dev/", // replace this with your deployed domain
  author: "Attila Szigeti",
  profile: "https://dotnetsziget.dev/about",
  desc: "Gyakorlati tapasztalatok és megoldások a .NET fejlesztés világából – C#, ASP.NET, unit tesztelés és még sok más.",
  title: ".NET Sziget",
  ogImage: "",
  lightAndDarkMode: true,
  postPerIndex: 5,
  postPerPage: 5,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true, // show back button in post detail
  showFeatured: false,
  editPost: {
    enabled: false,
    text: "Edit page",
    url: "",
  },
  dynamicOgImage: true,
  dir: "ltr", // "rtl" | "auto"
  lang: "hu", // html lang code. Set this empty and default will be "en"
  timezone: "Europe/Budapest", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;

export const LOGO_IMAGE = {
  enable: true,
  svg: false,
  width: 32,
  height: 32,
};
