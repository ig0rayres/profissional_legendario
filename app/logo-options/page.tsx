import { RotabusinessLogo } from "@/components/branding/logo";
import { LogoOption1, LogoOption2, LogoOption3 } from "@/components/branding/logo-variations";

export default function LogoOptionsPage() {
    return (
        <div className="min-h-screen bg-neutral-950 text-white p-10 flex flex-col items-center gap-12">
            <h1 className="text-3xl font-bold mb-8">Opções de Logo - ROTA</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl">
                {/* Original */}
                <div className="flex flex-col items-center gap-4 p-8 border border-neutral-800 rounded-xl bg-neutral-900/50">
                    <span className="text-neutral-400 text-sm uppercase tracking-widest">Original</span>
                    <RotabusinessLogo size={60} />
                    <p className="text-neutral-500 text-sm text-center mt-4">
                        Design atual: Montanha e Picareta.
                    </p>
                </div>

                {/* Option 1 */}
                <div className="flex flex-col items-center gap-4 p-8 border border-neutral-800 rounded-xl bg-neutral-900/50 hover:border-orange-500/50 transition-colors">
                    <span className="text-orange-500 text-sm uppercase tracking-widest">Opção 1: O Cume</span>
                    <LogoOption1 size={60} />
                    <p className="text-neutral-500 text-sm text-center mt-4">
                        Foco em ascensão e conquista. Linhas dinâmicas apontando para o topo.
                    </p>
                </div>

                {/* Option 2 */}
                <div className="flex flex-col items-center gap-4 p-8 border border-neutral-800 rounded-xl bg-neutral-900/50 hover:border-orange-500/50 transition-colors">
                    <span className="text-orange-500 text-sm uppercase tracking-widest">Opção 2: O Brasão</span>
                    <LogoOption2 size={60} />
                    <p className="text-neutral-500 text-sm text-center mt-4">
                        Formato de escudo/brasão. Transmite segurança, elite e tradição.
                    </p>
                </div>

                {/* Option 3 */}
                <div className="flex flex-col items-center gap-4 p-8 border border-neutral-800 rounded-xl bg-neutral-900/50 hover:border-orange-500/50 transition-colors">
                    <span className="text-orange-500 text-sm uppercase tracking-widest">Opção 3: A Construção</span>
                    <LogoOption3 size={60} />
                    <p className="text-neutral-500 text-sm text-center mt-4">
                        Geométrico e estrutural. Representa ferramentas, construção e solidez.
                    </p>
                </div>
            </div>

            <div className="mt-12 p-6 bg-white rounded-xl w-full max-w-4xl">
                <h2 className="text-black text-xl font-bold mb-6 text-center">Versão em Fundo Claro</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex justify-center p-4"><RotabusinessLogo size={50} className="text-black" /></div>
                    <div className="flex justify-center p-4"><LogoOption1 size={50} className="text-black" /></div>
                    <div className="flex justify-center p-4"><LogoOption2 size={50} className="text-black" /></div>
                    <div className="flex justify-center p-4"><LogoOption3 size={50} className="text-black" /></div>
                </div>
            </div>
        </div>
    );
}
