interface BlogEntryProps {
  date: string;
  category: string;
  title: string;
  abstract: string;
  categoryColor?: string;
}

export function BlogEntry({ date, category, title, abstract, categoryColor = "#000" }: BlogEntryProps) {
  return (
    <div className="grid grid-cols-[100px_120px_1fr] gap-6 py-5 border-b border-black/5 hover:bg-black/[0.02] transition-colors cursor-pointer group">
      <div className="font-mono text-[11px] text-black/40 tracking-wide pt-1">
        {date}
      </div>
      <div className="pt-1">
        <span 
          className="font-mono text-[10px] tracking-wider uppercase px-2 py-1 rounded-sm"
          style={{ 
            backgroundColor: categoryColor + '15',
            color: categoryColor
          }}
        >
          {category}
        </span>
      </div>
      <div className="min-w-0">
        <h3 
          className="text-[20px] leading-[1.3] mb-2 group-hover:opacity-70 transition-opacity"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          {title}
        </h3>
        <p className="text-[13px] text-black/60 leading-relaxed">
          {abstract}
        </p>
      </div>
    </div>
  );
}
