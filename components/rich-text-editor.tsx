interface RichTextEditorProps {
  content?: string
}

export function RichTextEditor({ content }: RichTextEditorProps) {
  const defaultContent = `
    <h2>Discovering the Magic of Montmartre</h2>
    
    <p>As I stepped off the funicular at the top of Montmartre, I knew I was in for something special. The cobblestone streets, the bohemian atmosphere, and the stunning views over Paris created an unforgettable experience that I'll treasure forever.</p>
    
    <h3>The Artist's Quarter</h3>
    
    <p>Montmartre has been the heart of Paris's artistic scene for over a century. Walking through Place du Tertre, you'll find street artists creating beautiful portraits and caricatures, just as Picasso and Renoir once did in these very streets.</p>
    
    <blockquote>
      "Montmartre is not just a neighborhood, it's a state of mind. Here, art flows through the streets like the Seine flows through Paris." - Local Artist Marie Dubois
    </blockquote>
    
    <h3>Must-Visit Spots</h3>
    
    <ul>
      <li><strong>Sacré-Cœur Basilica</strong> - The stunning white cathedral that watches over Paris</li>
      <li><strong>Moulin Rouge</strong> - The world-famous cabaret that defines Parisian nightlife</li>
      <li><strong>Place du Tertre</strong> - The heart of artistic Montmartre</li>
      <li><strong>Clos Montmartre</strong> - Paris's own vineyard producing local wine</li>
    </ul>
    
    <p>The best time to visit Montmartre is just before sunset. As the golden hour light hits the white stones of Sacré-Cœur, the entire neighborhood transforms into something magical. Don't forget to bring your camera!</p>
    
    <h3>Local Tips</h3>
    
    <p><em>Pro tip:</em> Skip the touristy restaurants around Place du Tertre and venture into the side streets for authentic bistros where locals actually eat. Try <strong>La Petit Montmartre</strong> for the best coq au vin in the area.</p>
  `

  return (
    <section className="bg-white rounded-2xl shadow-lg p-8">
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: content || defaultContent }}
      />
    </section>
  )
}