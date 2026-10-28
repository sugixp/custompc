import Link from "next/link";
import { CategoryGrid } from "@/components/category-grid";
import { CompatibilityExample } from "@/components/compatibility-example";
import { DemoVideo } from "@/components/demo-video";
import { SITE_TAGLINE } from "@/site";

const STEPS = [
  {
    title: "Escolha as peças",
    text: "Especificações tiradas dos sites dos fabricantes, com a fonte em cada peça.",
  },
  {
    title: "Confira a compatibilidade",
    text: "Soquete, memória, tamanho no gabinete e potência da fonte, com erros e avisos claros.",
  },
  {
    title: "Compare lojas brasileiras",
    text: "Preços em reais na Amazon, Mercado Livre, KaBuM!, Pichau e Terabyte.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1fr_26rem]">
        <div>
          <p className="spec-label text-accent">Montador de PC · Brasil</p>
          <h1 className="mt-3 max-w-3xl text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
            {SITE_TAGLINE}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            Compare ofertas de lojas brasileiras e veja na hora se o
            processador, a placa-mãe, a memória, a fonte e o gabinete funcionam
            juntos.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/montar"
              className="rounded-panel bg-accent px-5 py-2.5 font-medium text-accent-ink hover:brightness-110"
            >
              Montar meu PC
            </Link>
            <Link
              href="/pecas"
              className="rounded-panel border border-line-strong px-5 py-2.5 font-medium hover:border-accent hover:text-accent"
            >
              Explorar peças
            </Link>
          </div>
        </div>
        <CompatibilityExample />
      </section>

      <section
        aria-labelledby="como-funciona"
        className="border-y border-line py-8"
      >
        <h2 id="como-funciona" className="sr-only">
          Como funciona
        </h2>
        <ol className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span className="tabular text-sm text-accent">0{index + 1}</span>
              <div>
                <h3 className="font-medium">{step.title}</h3>
                <p className="mt-1 text-sm text-muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="demonstracao" className="pt-12">
        <h2 id="demonstracao" className="text-xl font-semibold">
          Veja o montador em ação
        </h2>
        <figure className="mt-5">
          <DemoVideo />
          <figcaption className="mt-3 text-sm text-muted">
            Uma build montada peça por peça: com um Ryzen AM5 escolhido, a
            placa-mãe AM4 aparece como incompatível e o motivo é explicado; no
            fim, a build fica sem problemas, com o total em reais e por loja.
          </figcaption>
        </figure>
      </section>

      <section aria-labelledby="categorias" className="py-12">
        <h2 id="categorias" className="text-xl font-semibold">
          Categorias
        </h2>
        <div className="mt-5">
          <CategoryGrid headingLevel={3} />
        </div>
      </section>
    </div>
  );
}
