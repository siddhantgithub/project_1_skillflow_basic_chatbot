/* eslint-disable @next/next/no-img-element */

import { ImageResponse } from "next/server";

export const runtime = "edge";
export const preferredRegion = ["iad1"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const title = searchParams.get("title") || "SkillFlow-AI Client";
  const description = searchParams.get("description") || "AI-Powered Support Assistant";

  const geistSemibold = await fetch(
    new URL("../../assets/geist-semibold.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        tw="flex h-full w-full"
        style={{
          fontFamily: "Geist Sans",
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        }}
      >
        {/* Company branding background */}
        <div tw="flex flex-col absolute h-full w-full justify-center items-center">
          {/* Gradient overlay */}
          <div
            tw="absolute inset-0"
            style={{
              background: "radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)",
            }}
          />
          <div
            tw="absolute inset-0"
            style={{
              background: "radial-gradient(circle at 70% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)",
            }}
          />

          {/* Content */}
          <div tw="flex flex-col items-center justify-center px-20 z-10">
            {/* Logo/Icon */}
            <div
              tw="flex items-center justify-center mb-12"
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              }}
            >
              <div
                tw="text-white text-6xl font-bold"
                style={{ fontFamily: "Geist Sans" }}
              >
                SF
              </div>
            </div>

            {/* Title */}
            <div
              tw="text-white tracking-tight flex text-center leading-[1.1] mb-6"
              style={{
                fontWeight: 700,
                fontSize: 72,
                letterSpacing: "-0.03em",
              }}
            >
              {title}
            </div>

            {/* Description */}
            <div
              tw="text-center text-5xl"
              style={{
                color: "#94a3b8",
                fontWeight: 500,
              }}
            >
              {description}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 628,
      fonts: [
        {
          name: "geist",
          data: geistSemibold,
          style: "normal",
        },
      ],
    }
  );
}
