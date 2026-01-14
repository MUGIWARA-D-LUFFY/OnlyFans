'use client';

interface MediaViewerProps {
  url: string;
  type: 'image' | 'video';
  alt?: string;
}

export default function MediaViewer({ url, type, alt = 'Media' }: MediaViewerProps) {
  if (type === 'image') {
    return (
      <div className="media">
        <img
          src={url}
          alt={alt}
          style={{
            maxHeight: '80vh',
            objectFit: 'contain'
          }}
        />
      </div>
    );
  }

  return (
    <div className="media">
      <video
        src={url}
        controls
        style={{
          maxHeight: '80vh'
        }}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}


