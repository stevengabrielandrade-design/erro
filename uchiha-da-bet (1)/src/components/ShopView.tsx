import React from 'react';
import { ShoppingBag, MessageCircle, ExternalLink, Sparkles, Tag, ShieldCheck } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  badge?: string;
}

const PRODUCTS: Product[] = [
  {
    id: 'tshirt-master-ht',
    name: 'T-Shirt Oficial Uchiha — Mestre do HT',
    category: 'Vestuário',
    price: 18500,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60',
    description: 'Camiseta algodão egípcio 100% premium com estampa ocular Sharingan e lema técnico.',
    badge: 'MAIS VENDIDA',
  },
  {
    id: 'hoodie-uchiha-black',
    name: 'Hoodie / Casaco Uchiha Stealth Black',
    category: 'Vestuário',
    price: 34000,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=60',
    description: 'Casaco com capuz pesado, forro térmico, bordado em relevo no peito e acabamento pro.',
    badge: 'PREMIUM',
  },
  {
    id: 'cap-uchiha-red',
    name: 'Boné Bordado Uchiha da Bet Snapback',
    category: 'Acessórios',
    price: 12500,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&auto=format&fit=crop&q=60',
    description: 'Boné com bordado de alta precisão 3D e aba com detalhe em vermelho carmesim.',
  },
  {
    id: 'bottle-thermal-uchiha',
    name: 'Garrafa Térmica 750ml Inox Uchiha',
    category: 'Acessórios',
    price: 14000,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60',
    description: 'Mantém gelado por até 24h para longas sessões de monitoramento de futebol.',
  },
];

interface ShopViewProps {
  whatsappNumber?: string;
  currency?: string;
}

export const ShopView: React.FC<ShopViewProps> = ({
  whatsappNumber = '+244923000000',
  currency = 'Kz',
}) => {
  const handleBuyWhatsapp = (product: Product) => {
    const text = encodeURIComponent(
      `Olá! Tenho interesse em adquirir o produto oficial do Uchiha da Bet:\n\n*${product.name}*\nPreço: ${product.price.toLocaleString(
        'pt-PT'
      )} ${currency}\n\nPoderiam me passar os detalhes de pagamento e envio?`
    );
    window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-950/60 via-[#181820] to-[#121216] border border-red-900/40 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-orange-600/20 text-orange-400 border border-orange-500/30">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white uppercase tracking-wider font-mono">
                Loja Oficial Uchiha da Bet
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-950 text-orange-300 border border-orange-800">
                PRODUTOS EXCLUSIVOS
              </span>
            </div>
            <p className="text-xs text-zinc-300 mt-1 max-w-xl leading-relaxed">
              Vista a identidade dos melhores operadores. Pedidos processados e confirmados diretamente com nossa equipa via WhatsApp.
            </p>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PRODUCTS.map((p) => (
          <div
            key={p.id}
            className="bg-[#121216] border border-zinc-800 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-orange-500/40 transition-all shadow-md"
          >
            <div>
              <div className="h-48 w-full relative overflow-hidden bg-zinc-950">
                <img
                  src={p.image}
                  alt={p.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {p.badge && (
                  <span className="absolute top-3 left-3 bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md shadow uppercase tracking-wider">
                    {p.badge}
                  </span>
                )}
                <span className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-zinc-300 font-semibold text-[10px] px-2 py-0.5 rounded border border-zinc-700">
                  {p.category}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <h4 className="text-sm font-extrabold text-white leading-snug">{p.name}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{p.description}</p>
              </div>
            </div>

            <div className="p-4 pt-0 flex items-center justify-between border-t border-zinc-800/80 mt-2 pt-3">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Valor</span>
                <span className="text-base font-black text-orange-400 font-mono">
                  {p.price.toLocaleString('pt-PT')} <span className="text-xs text-zinc-300 font-normal">{currency}</span>
                </span>
              </div>

              <button
                onClick={() => handleBuyWhatsapp(p)}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-950/40 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>COMPRAR NO WHATSAPP</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Safety & Delivery Information */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 flex items-center gap-3 text-xs text-zinc-400">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
        <span>
          Entregas para todas as províncias com rastreio garantido e pagamento seguro via Multicaixa Express ou Transferência Bancária.
        </span>
      </div>
    </div>
  );
};
