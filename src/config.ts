export const SITE = {
  website: "https://dotnetsziget.dev/",
  author: "Attila Szigeti",
  profile: "https://dotnetsziget.dev/about",
  desc: "Egy blog, amely lefedi a .NET fejlesztés minden területét: ASP.NET, C#, unit tesztelés és sok más téma.",
  title: ".NET Sziget",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 5,
  postPerPage: 5,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true,
  editPost: {
    enabled: false,
    text: "Javaslat küldése",
    url: "https://github.com/szigat/dotnetsziget/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr",
  lang: "hu",
  timezone: "Europe/Budapest",
  logoImage: {
    enable: true,
    svg: false,
    width: 46,
    height: 46,
  },
} as const;

export const LOGO_IMAGE = SITE.logoImage;
