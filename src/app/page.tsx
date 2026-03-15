import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold tracking-tight">nestorsegura.com</h1>
      <p className="text-muted-foreground text-lg">
        Web design for real estate agents in Germany
      </p>
      <Button>Get Started</Button>
    </main>
  )
}
