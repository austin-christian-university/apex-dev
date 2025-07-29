export default function TestPage() {
    return (
        <div className="bg-background text-foreground p-8">
            <h1 className="text-3xl font-bold mb-4">Test Page</h1>
            <p className="mb-8">This should be soft black background with almost white text.</p>
            
            <div className="space-y-8">
                {/* Color Test */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Color Test</h2>
                    <div className="bg-card text-card-foreground p-4 rounded-lg border">
                        <h3 className="text-xl font-semibold mb-2">Card Component</h3>
                        <p className="text-muted-foreground">This is muted text on a card background.</p>
                    </div>
                    
                    <div className="flex gap-4">
                        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90">
                            Primary Button
                        </button>
                        <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90">
                            Secondary Button
                        </button>
                        <button className="bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:bg-accent/90">
                            Accent Button
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}