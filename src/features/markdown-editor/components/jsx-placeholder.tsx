'use client'
import type { JsxEditorProps } from '@mdxeditor/editor'
import { useNestedEditorContext } from '@mdxeditor/editor'
import { YouTube } from './youtube'
import { TikTok } from './tiktok'
import { useContext } from 'react'
import { MarkdownEditorContext } from '../view'

export function JsxPlaceholder({ mdastNode, descriptor }: JsxEditorProps) {
    useNestedEditorContext()
    const editor = useContext(MarkdownEditorContext)
    const attributes = mdastNode.attributes || []
    const idProp = attributes.find(attr => attr.type === 'mdxJsxAttribute' && attr.name === 'id')
    const urlProp = attributes.find(attr => attr.type === 'mdxJsxAttribute' && attr.name === 'url')

    const isYouTube = descriptor.name === 'YouTube'
    const isTikTok = descriptor.name === 'TikTok'

    let id = idProp && idProp.type === 'mdxJsxAttribute' && typeof idProp.value === 'string'
        ? idProp.value
        : ''

    let url = urlProp && urlProp.type === 'mdxJsxAttribute' && typeof urlProp.value === 'string'
        ? urlProp.value
        : ''

		const removeSelf = () => {
			try {
			  if (!editor) return
			  const markdown = editor.getMarkdown() ?? ''
		  
			  // helper: regexp to find a single tag (supports both self-closing and paired tags)
			  const makeTagRegexp = (name: string, attrName: string, attrValue: string | undefined) => {
				const safeVal = (attrValue ?? '').replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
				// if a value is provided — match exactly by it; otherwise match any attribute
				if (safeVal) {
				  return new RegExp(
					`<${name}\\b[^>]*${attrName}\\s*=\\s*["']${safeVal}["'][^>]*>(?:\\s*</${name}>)?|<${name}\\b[^>]*${attrName}\\s*=\\s*["']${safeVal}["'][^>]*\\/?>`,
					'i'
				  )
				}
				return new RegExp(`<${name}\\b[^>]*>(?:\\s*</${name}>)?|<${name}\\b[^>]*\\/?>`, 'i')
			  }
		  
			  const nodeName = descriptor?.name ?? ''
			  const attrName = nodeName === 'YouTube' ? 'id' : 'url'
			  const attrValue = nodeName === 'YouTube' ? id : url
		  
			  // 1) Try to remove by position, but only if the content looks like a tag
			  const start = (mdastNode as any)?.position?.start?.offset
			  const end = (mdastNode as any)?.position?.end?.offset
		  
			  if (
				typeof start === 'number' &&
				typeof end === 'number' &&
				end > start &&
				start >= 0 &&
				end <= markdown.length
			  ) {
				const slice = markdown.slice(start, end)
				const posRegexp = makeTagRegexp(nodeName, attrName, attrValue)
				if (posRegexp.test(slice)) {
					  // remove exactly the range [start, end)
				  let next = markdown.slice(0, start) + markdown.slice(end)
		  
					  // remove extra double newlines around the deletion
				  next = next.replace(/\n{3,}/g, '\n\n')
				  editor.setMarkdown(next)
				  editor.focus()
				  return
				}
					// If the slice doesn't look like a tag — do NOT use it (fallback below)
			  }
		  
				  // 2) Fallback: find the nearest/first tag occurrence in markdown using regexp
			  const globalRegexp = makeTagRegexp(nodeName, attrName, attrValue)
			  const allMatches: { index: number; match: string }[] = []
			  let m: RegExpExecArray | null
			  const g = new RegExp(globalRegexp.source, 'ig')
			  while ((m = g.exec(markdown)) !== null) {
				allMatches.push({ index: m.index, match: m[0] })
					// safeguard against an infinite loop
				if (g.lastIndex === m.index) g.lastIndex++
			  }
		  
				  if (allMatches.length === 0) {
					// nothing found — as a last resort, do not modify the document
				console.warn('JsxPlaceholder: cannot find matching JSX tag to remove', {
				  nodeName,
				  attrName,
				  attrValue
				})
				return
			  }
		  
				  // if a start position exists — choose the closest match to start; otherwise take the first
			  let chosen = allMatches[0]
			  if (typeof start === 'number') {
				let best = allMatches[0]
				let bestDist = Math.abs(allMatches[0].index - start)
				for (const it of allMatches) {
				  const d = Math.abs(it.index - start)
				  if (d < bestDist) {
					best = it
					bestDist = d
				  }
				}
				chosen = best
			  }
		  
				  // remove only the chosen occurrence
			  const before = markdown.slice(0, chosen.index)
			  const after = markdown.slice(chosen.index + chosen.match.length)
			  let next = before + after
		  
				  // carefully remove extra blank lines around
			  next = next.replace(/\n{3,}/g, '\n\n')
				  // and if a single line was removed, trim one extra leading/trailing newline
			  next = next.replace(/^\s*\n/, '')
			  next = next.replace(/\n\s*$/, '')
		  
			  editor.setMarkdown(next)
			  editor.focus()
			} catch (err) {
			  console.warn('JsxPlaceholder: failed to remove JSX node', err)
			}
		  }
		  
		  

    const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
        if (e.key === 'Backspace' || e.key === 'Delete') {
            e.preventDefault()
            removeSelf()
        }
    }

    const content = isYouTube && id
        ? <YouTube id={id} />
        : isTikTok && url
            ? <TikTok url={url} />
            : (
                <div style={{
                    border: '1px dashed #d1d5db',
                    borderRadius: 8,
                    background: '#fafafa',
                    color: '#6b7280',
                    padding: 12,
                    textAlign: 'center'
                }}>
                    {descriptor.name}
                </div>
            )

    return (
        <div
            tabIndex={0}
            contentEditable={false}
            onKeyDown={onKeyDown}
            style={{ position: 'relative', outline: 'none' }}
        >
            {/* delete button */}
            <button
                type="button"
                onClick={removeSelf}
                title="Удалить"
                style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    padding: '2px 6px',
                    cursor: 'pointer',
                    lineHeight: 1
                }}
            >
                ×
            </button>
            {content}
        </div>
    )
}
