import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Shield, Zap, Crown } from 'lucide-react'
import Link from 'next/link'

export function PlansSection() {
    const plans = [
        {
            name: "Recruta",
            price: "Grátis",
            description: "O início da sua jornada na guilda.",
            features: [
                "Perfil Básico",
                "Listagem na busca",
                "1 Especialidade",
                "Acesso à comunidade"
            ],
            icon: Shield,
            cta: "Alistar-se Agora",
            href: "/auth/register",
            variant: "outline",
            popular: false
        },
        {
            name: "Veterano",
            price: "R$ 47",
            period: "/mês",
            description: "Para quem já provou seu valor no campo.",
            features: [
                "Perfil Completo",
                "Destaque na busca",
                "Até 3 Especialidades",
                "Selo de Verificado",
                "Galeria de Projetos (5)",
                "Receber Avaliações"
            ],
            icon: Zap,
            cta: "Tornar-se Veterano",
            href: "/api/plans/subscribe?plan=veteran",
            variant: "default",
            popular: false
        },
        {
            name: "Elite",
            price: "R$ 147",
            period: "/mês",
            description: "A força máxima da elite de negócios.",
            features: [
                "Tudo do plano Veterano",
                "Destaque Premium na Home",
                "Especialidades Ilimitadas",
                "Selo Elite Dourado",
                "Galeria Ilimitada",
                "Acesso a Eventos Exclusivos",
                "Mentoria Mensal em Grupo"
            ],
            icon: Crown,
            cta: "Acessar a Elite",
            href: "/api/plans/subscribe?plan=elite",
            variant: "default",
            popular: true
        }
    ]

    return (
        <section id="planos" className="py-20 bg-card/30 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-impact text-primary mb-6">
                        ESCOLHA SUA JORNADA
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Invista na sua carreira e faça parte da elite. Escolha o plano que melhor se adapta aos seus objetivos.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan) => (
                        <Card
                            key={plan.name}
                            className={`relative flex flex-col ${plan.popular
                                ? 'border-primary shadow-lg shadow-primary/20 scale-105 z-10 bg-card/80 backdrop-blur-sm'
                                : 'border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/40'
                                } transition-all duration-300`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-primary text-primary-foreground text-sm font-bold px-4 py-1 rounded-full shadow-lg">
                                        MAIS POPULAR
                                    </span>
                                </div>
                            )}

                            <CardHeader className="text-center pb-8">
                                <div className="mx-auto p-4 rounded-full bg-primary/10 mb-4 w-16 h-16 flex items-center justify-center">
                                    <plan.icon className={`w-8 h-8 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                                </div>
                                <CardTitle className="text-3xl font-bold text-impact mb-2">
                                    {plan.name}
                                </CardTitle>
                                <CardDescription className="text-base">
                                    {plan.description}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="flex-1">
                                <div className="text-center mb-8">
                                    <span className="text-4xl font-bold text-foreground">
                                        {plan.price}
                                    </span>
                                    {plan.period && (
                                        <span className="text-muted-foreground ml-1">
                                            {plan.period}
                                        </span>
                                    )}
                                </div>

                                <ul className="space-y-4">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                            <span className="text-sm text-muted-foreground">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>

                            <CardFooter className="pt-8">
                                <Link href={plan.href} className="w-full">
                                    <Button
                                        size="lg"
                                        className={`w-full text-lg h-12 ${plan.popular
                                            ? 'glow-orange-strong font-bold'
                                            : ''
                                            }`}
                                        variant={plan.popular ? 'default' : 'outline'}
                                    >
                                        {plan.cta}
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <p className="text-muted-foreground mb-4">
                        Dúvidas sobre qual plano escolher?
                    </p>
                    <Link href="/contact">
                        <Button variant="ghost" className="text-primary text-lg hover:bg-transparent hover:underline p-0">
                            Fale com nossa equipe
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}
