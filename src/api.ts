import axios from "axios";
import * as cheerio from 'cheerio';
import { VideoInfo } from "./types.js";

async function crawlBilibili(tagSelector: string, k: number = 5, order: string = 'default'): Promise<VideoInfo[]> {
  const baseUrl = order === 'default' ? `https://search.bilibili.com/all?keyword=${encodeURIComponent(tagSelector)}` : `https://search.bilibili.com/all?keyword=${encodeURIComponent(tagSelector)}&order=${order}`;
  
  try {
    const { data } = await axios.get(baseUrl);
    const $ = cheerio.load(data);

    const videos: VideoInfo[] = [];
    const videoCards = $(".bili-video-card");

    const totalVideos: number = videoCards.length;

    const numberOfVideosToSelect: number = Math.min(k, totalVideos);
    const selectedIndexes: Set<number> = new Set();

    while (selectedIndexes.size < numberOfVideosToSelect) {
      const randomIndex: number = Math.floor(Math.random() * totalVideos);
      selectedIndexes.add(randomIndex);
    }

    selectedIndexes.forEach((index: number) => {
      const element: any = videoCards[index];

      const title: string = $(element)
        .find(".bili-video-card__info--tit")
        .attr("title") || ""
        .trim();
      const link: string = $(element).find("a").attr("href") || "";
      const cover: string = $(element).find("img").attr("src") || "";
      const author: string = $(element)
        .find(".bili-video-card__info--author")
        .text()
        .trim();
      const views: string = $(element).find("span").first().text().trim();
      const duration: string = $(element)
        .find(".bili-video-card__stats__duration")
        .text()
        .trim();

      const fullLink: string = link.startsWith("http") ? link : `https:${link}`;
      const fullCover: string = cover.startsWith("http") ? cover : `https:${cover}`;

      if (!fullLink.includes("bilibili.com/video")) {
        console.log(`抛弃链接: ${fullLink}`);
        return; // 如果不包含，则跳过当前循环
      }

      videos.push({
        title,
        link: fullLink,
        cover: fullCover,
        author,
        views,
        duration,
        source: "bilibili",
      });
    });

    return videos;
  } catch (error: unknown) {
    console.error("爬虫错误:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

export { crawlBilibili };
