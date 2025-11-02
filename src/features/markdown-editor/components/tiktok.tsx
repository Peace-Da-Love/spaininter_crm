'use client'
import { useEffect } from 'react'

export function TikTok({ url }: { url: string }) {
    useEffect(() => {
        const src = 'https://www.tiktok.com/embed.js'
        if (!document.querySelector(`script[src="${src}"]`)) {
            const script = document.createElement('script')
            script.src = src
            script.async = true
            document.body.appendChild(script)
        }
    }, [])

    const videoId = url.match(/\/video\/(\d+)/)?.[1] || ''

    return (
        <blockquote
            className="tiktok-embed"
            cite={url}
            data-video-id={videoId}
            style={{ maxWidth: 605, minWidth: 325, border: 'none', margin: 0, padding: 0 }}
        >
            <section />
        </blockquote>
    )
}

