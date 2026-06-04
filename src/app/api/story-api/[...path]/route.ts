import { NextRequest, NextResponse } from "next/server"

const STORY_API_ORIGIN = "http://172.192.41.96:1317"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const target = `${STORY_API_ORIGIN}/${path.join("/")}${request.nextUrl.search}`

  const res = await fetch(target, {
    headers: { Accept: "application/json" },
  })

  const body = await res.text()
  return new NextResponse(body, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const target = `${STORY_API_ORIGIN}/${path.join("/")}${request.nextUrl.search}`

  const body = await request.text()
  const res = await fetch(target, {
    method: "POST",
    headers: {
      "Content-Type": request.headers.get("Content-Type") || "application/json",
      Accept: "application/json",
    },
    body,
  })

  const resBody = await res.text()
  return new NextResponse(resBody, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
  })
}

export const runtime = "nodejs"
