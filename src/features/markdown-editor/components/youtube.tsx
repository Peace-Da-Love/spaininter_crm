'use client'

export function YouTube({ id }: { id: string }) {
	return (
        <iframe
            src={`https://www.youtube.com/embed/${id}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            style={{ width: '100%', aspectRatio: '16 / 9', border: 0 }}
        />
	);
}

