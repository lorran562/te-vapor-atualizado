'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Lock, User, Key, ChevronLeft, Save, LogOut, Trash2, Plus, ChevronDown, ChevronRight, Smartphone, Settings, Package, Check, AlertTriangle, Image as ImageIcon, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useProducts, Product } from '@/hooks/use-products';
import Logo from './Logo';

export default function AdminPanel() {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const { products: serverProducts, saveProducts, uploadImage, isLoading, isSaving } = useProducts();
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'produtos' | 'configuracoes'>('produtos');
  const [expandedBrands, setExpandedBrands] = useState<string[]>([]);
  const [expandedProducts, setExpandedProducts] = useState<string[]>([]);
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  
  // Confirmation states
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'brand' | 'product', id: string } | null>(null);

  // Handle hydration
  useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  // Sync local state when server products load
  useEffect(() => {
    if (!isLoading && serverProducts) {
      console.log('Syncing server products to local state:', serverProducts.length);
      setLocalProducts(serverProducts); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [serverProducts, isLoading]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt with:', cpf);
    if (cpf === '02608151280' && password === '02608151280') {
      setIsLoggedIn(true);
    } else {
      console.error('Credenciais inválidas');
      try {
        window.alert('Credenciais inválidas. Use o CPF cadastrado.');
      } catch (err) {
        // Fallback if alert is blocked
      }
    }
  };

  const handleImageUpload = async (id: string, file: File) => {
    try {
      setUploadingId(id);
      
      // Optional: Resize before upload to save bandwidth/storage
      // But user asked for "1GB support", so maybe they want high quality.
      // I'll keep a reasonable limit of 1200px for web.
      const resizedFile = await new Promise<File>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new window.Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const MAX_SIZE = 1200;

            if (width > MAX_SIZE || height > MAX_SIZE) {
              if (width > height) {
                height *= MAX_SIZE / width;
                width = MAX_SIZE;
              } else {
                width *= MAX_SIZE / height;
                height = MAX_SIZE;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(new File([blob], file.name, { type: 'image/jpeg' }));
              } else {
                resolve(file);
              }
            }, 'image/jpeg', 0.85);
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      });

      const publicUrl = await uploadImage(resizedFile);
      if (publicUrl) {
        updateProduct(id, { image: publicUrl });
      } else {
        alert('Erro ao fazer upload da imagem para o Supabase. Verifique as configurações de Storage.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erro no upload.');
    } finally {
      setUploadingId(null);
    }
  };

  const handleImportJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json)) {
          setLocalProducts(json);
          alert('Produtos importados com sucesso! Não esqueça de clicar em "Salvar Tudo".');
        }
      } catch (err) {
        alert('Erro ao ler o arquivo JSON. Verifique se o formato está correto.');
      }
    };
    reader.readAsText(file);
  };

  const brands = Array.from(new Set(localProducts.map(p => p.brand)));

  const toggleBrand = useCallback((brand: string) => {
    console.log('Toggling brand:', brand);
    setExpandedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  }, []);

  const toggleProduct = useCallback((id: string) => {
    console.log('Toggling product:', id);
    setExpandedProducts(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  }, []);

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setLocalProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const addFlavor = (id: string) => {
    setLocalProducts(prev => prev.map(p => {
      if (p.id === id) {
        const newFlavor = { name: 'Novo Sabor', available: true };
        return { ...p, flavors: [...p.flavors, newFlavor] };
      }
      return p;
    }));
  };

  const removeFlavor = (id: string, flavorIndex: number) => {
    setLocalProducts(prev => prev.map(p => {
      if (p.id === id) {
        const newFlavors = [...p.flavors];
        newFlavors.splice(flavorIndex, 1);
        return { ...p, flavors: newFlavors };
      }
      return p;
    }));
  };

  const updateFlavor = (id: string, flavorIndex: number, newValue: string) => {
    setLocalProducts(prev => prev.map(p => {
      if (p.id === id) {
        const newFlavors = [...p.flavors];
        const currentFlavor = newFlavors[flavorIndex];
        
        if (typeof currentFlavor === 'string') {
          newFlavors[flavorIndex] = { name: newValue, available: true };
        } else {
          newFlavors[flavorIndex] = { ...currentFlavor, name: newValue };
        }
        
        return { ...p, flavors: newFlavors };
      }
      return p;
    }));
  };

  const toggleFlavorAvailability = (id: string, flavorIndex: number) => {
    setLocalProducts(prev => prev.map(p => {
      if (p.id === id) {
        const newFlavors = [...p.flavors];
        const currentFlavor = newFlavors[flavorIndex];
        
        if (typeof currentFlavor === 'string') {
          newFlavors[flavorIndex] = { name: currentFlavor, available: false };
        } else {
          newFlavors[flavorIndex] = { ...currentFlavor, available: !currentFlavor.available };
        }
        
        return { ...p, flavors: newFlavors };
      }
      return p;
    }));
  };

  const removeProduct = (id: string) => {
    setLocalProducts(prev => prev.filter(p => p.id !== id));
    setConfirmDelete(null);
  };

  const addProduct = (brand: string) => {
    const newProduct: Product = {
      id: Math.random().toString(36).substr(2, 9),
      brand,
      model: 'Novo Modelo',
      price: 0,
      flavors: [],
      image: '',
      available: true,
    };
    setLocalProducts(prev => [...prev, newProduct]);
    setExpandedProducts(prev => [...prev, newProduct.id]);
  };

  const addBrand = () => {
    setIsAddingBrand(true);
  };

  const confirmAddBrand = () => {
    if (newBrandName.trim()) {
      addProduct(newBrandName.trim());
      setExpandedBrands(prev => [...prev, newBrandName.trim()]);
      setNewBrandName('');
      setIsAddingBrand(false);
    }
  };

  const handleSaveAll = async () => {
    setSaveStatus('saving');
    try {
      await saveProducts(localProducts);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
    }
  };

  useEffect(() => {
    if (isSaving) {
      setSaveStatus('saving');
    }
  }, [isSaving]);

  const removeBrand = (brand: string) => {
    setLocalProducts(prev => prev.filter(p => p.brand !== brand));
    setConfirmDelete(null);
  };

  if (!mounted) return null;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-zinc-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-xl"
        >
          <div className="flex flex-col items-center mb-8">
            <Logo className="relative h-20 w-20 mb-4" />
            <h1 className="text-2xl font-black tracking-tight">Painel Admin</h1>
            <p className="text-zinc-500 text-sm">T7 VAPOR - Acesso restrito</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                <User size={14} /> CPF / Usuario
              </label>
              <input
                type="text"
                placeholder="Digite seu usuario"
                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-primary/50 transition-all"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                <Key size={14} /> Senha
              </label>
              <input
                type="password"
                placeholder="Digite sua senha"
                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-primary/50 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-black font-black py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              Entrar
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
              Ativar o Windows
              <br />
              Acesse Configurações para ativar o Windows.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => setIsLoggedIn(false)}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
            >
              <ChevronLeft size={18} /> Voltar
            </button>
            <h1 className="text-xl font-black tracking-tight">Painel Admin</h1>
          </div>

          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={handleSaveAll}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                saveStatus === 'saved' ? 'bg-emerald-500 text-white' : 'bg-primary text-black hover:bg-primary-hover'
              }`}
            >
              {saveStatus === 'saving' ? (
                <div className="h-4 w-4 border-2 border-black/30 border-t-black animate-spin rounded-full" />
              ) : saveStatus === 'saved' ? (
                <Check size={18} />
              ) : (
                <Save size={18} />
              )}
              {saveStatus === 'saving' ? 'Salvando...' : saveStatus === 'saved' ? 'Salvo!' : 'Salvar Tudo'}
            </button>
            <button 
              type="button"
              onClick={() => setIsLoggedIn(false)}
              className="flex items-center gap-2 bg-zinc-900 border border-white/10 px-4 py-2 rounded-lg font-bold text-sm hover:bg-zinc-800 transition-all"
            >
              <LogOut size={18} /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-10 w-10 border-4 border-primary/30 border-t-primary animate-spin rounded-full" />
            <p className="text-zinc-500 font-bold animate-pulse">Carregando produtos do servidor...</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-8">
              <button
                type="button"
                onClick={() => setActiveTab('produtos')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  activeTab === 'produtos' ? 'bg-primary text-black' : 'bg-zinc-900 text-zinc-400 border border-white/5'
                }`}
              >
                <Package size={18} /> Produtos
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('configuracoes')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  activeTab === 'configuracoes' ? 'bg-primary text-black' : 'bg-zinc-900 text-zinc-400 border border-white/5'
                }`}
              >
                <Settings size={18} /> Configuracoes
              </button>
            </div>

            {activeTab === 'produtos' && (
              <div className="space-y-4">
                {brands.map(brand => (
                  <div key={brand} className="bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden">
                    <div 
                      className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => toggleBrand(brand)}
                    >
                      <div className="flex items-center gap-4">
                        {expandedBrands.includes(brand) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        <h2 className="text-primary font-black uppercase tracking-widest">{brand}</h2>
                        <span className="bg-zinc-800 px-3 py-1 rounded-full text-[10px] font-bold text-zinc-400">
                          {localProducts.filter(p => p.brand === brand).length} produtos
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setConfirmDelete({ type: 'brand', id: brand }); }}
                        className="text-red-500/50 hover:text-red-500 transition-colors p-2"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <AnimatePresence>
                      {expandedBrands.includes(brand) && (
                        <motion.div
                          key={`brand-content-${brand}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-white/5"
                        >
                          <div className="p-6 space-y-4">
                            {localProducts.filter(p => p.brand === brand).map(product => (
                              <div key={product.id} className="bg-zinc-950 border border-white/5 rounded-xl overflow-hidden">
                                <div 
                                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                                  onClick={() => toggleProduct(product.id)}
                                >
                                  <div className="flex items-center gap-4">
                                    {expandedProducts.includes(product.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                    <span className="font-bold">{product.model}</span>
                                    {product.puffs && <span className="bg-zinc-800 px-2 py-0.5 rounded text-[10px] text-zinc-400">{product.puffs}</span>}
                                    <span className="text-primary font-bold">R$ {(product.price || 0).toFixed(2)}</span>
                                  </div>
                                  <button 
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setConfirmDelete({ type: 'product', id: product.id }); }}
                                    className="text-red-500/50 hover:text-red-500 transition-colors p-2"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>

                                <AnimatePresence>
                                  {expandedProducts.includes(product.id) && (
                                    <motion.div
                                      key={`product-content-${product.id}`}
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden border-t border-white/5 p-6"
                                    >
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="space-y-2">
                                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Modelo</label>
                                          <input 
                                            type="text" 
                                            value={product.model}
                                            onChange={(e) => updateProduct(product.id, { model: e.target.value })}
                                            className="w-full bg-zinc-900 border border-white/5 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Capacidade</label>
                                          <input 
                                            type="text" 
                                            value={product.puffs}
                                            onChange={(e) => updateProduct(product.id, { puffs: e.target.value })}
                                            className="w-full bg-zinc-900 border border-white/5 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Preco (R$)</label>
                                          <input 
                                            type="number" 
                                            value={product.price}
                                            onChange={(e) => updateProduct(product.id, { price: parseFloat(e.target.value) || 0 })}
                                            className="w-full bg-zinc-900 border border-white/5 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
                                          />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                            <ImageIcon size={12} /> Foto do Modelo
                                          </label>
                                          <div className="flex flex-col md:flex-row gap-4">
                                            <div className="relative group w-full md:w-32 h-32 bg-zinc-900 border border-white/5 rounded-xl overflow-hidden flex items-center justify-center">
                                              {uploadingId === product.id ? (
                                                <div className="flex flex-col items-center gap-2">
                                                  <div className="h-6 w-6 border-2 border-primary/30 border-t-primary animate-spin rounded-full" />
                                                  <span className="text-[8px] font-bold text-primary animate-pulse">UPLOADING...</span>
                                                </div>
                                              ) : product.image ? (
                                                <>
                                                  <Image 
                                                    src={product.image} 
                                                    alt={product.model} 
                                                    fill
                                                    className="object-cover"
                                                    referrerPolicy="no-referrer"
                                                  />
                                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <label className="cursor-pointer p-2 bg-primary text-black rounded-full hover:scale-110 transition-transform" title="Trocar Foto">
                                                      <Upload size={16} />
                                                      <input 
                                                        type="file" 
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                          const file = e.target.files?.[0];
                                                          if (file) handleImageUpload(product.id, file);
                                                        }}
                                                      />
                                                    </label>
                                                    <button 
                                                      type="button"
                                                      onClick={() => updateProduct(product.id, { image: '' })}
                                                      className="p-2 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"
                                                      title="Remover Foto"
                                                    >
                                                      <Trash2 size={16} />
                                                    </button>
                                                  </div>
                                                </>
                                              ) : (
                                                <label className="w-full h-full flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-colors">
                                                  <Upload size={24} className="text-zinc-600" />
                                                  <span className="text-[10px] font-bold text-zinc-600 uppercase">Upload</span>
                                                  <input 
                                                    type="file" 
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                      const file = e.target.files?.[0];
                                                      if (file) handleImageUpload(product.id, file);
                                                    }}
                                                  />
                                                </label>
                                              )}
                                            </div>
                                            <div className="flex-grow space-y-2">
                                              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Ou use uma URL externa</label>
                                              <input 
                                                type="text" 
                                                placeholder="https://exemplo.com/imagem.jpg"
                                                value={product.image}
                                                onChange={(e) => updateProduct(product.id, { image: e.target.value })}
                                                className="w-full bg-zinc-900 border border-white/5 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
                                              />
                                              <p className="text-[10px] text-zinc-500 italic">
                                                Dica: Você pode carregar uma foto da sua galeria clicando no quadro acima.
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="space-y-2">
                                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Disponibilidade do Modelo</label>
                                          <div 
                                            onClick={() => updateProduct(product.id, { available: !product.available })}
                                            className={`w-full flex items-center justify-between bg-zinc-900 border border-white/5 rounded-lg px-4 py-2 cursor-pointer transition-all ${product.available ? 'border-primary/30' : 'border-red-500/30'}`}
                                          >
                                            <span className={`text-xs font-bold ${product.available ? 'text-primary' : 'text-red-500'}`}>
                                              {product.available ? 'DISPONÍVEL' : 'INDISPONÍVEL'}
                                            </span>
                                            <div className={`w-10 h-5 rounded-full relative transition-colors ${product.available ? 'bg-primary' : 'bg-zinc-700'}`}>
                                              <motion.div 
                                                animate={{ x: product.available ? 20 : 4 }}
                                                className="absolute top-1 w-3 h-3 bg-white rounded-full" 
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Sabores</label>
                                          <button 
                                            type="button"
                                            onClick={() => addFlavor(product.id)}
                                            className="flex items-center gap-1 text-[10px] font-bold bg-zinc-800 px-3 py-1 rounded-full hover:bg-zinc-700 transition-colors"
                                          >
                                            <Plus size={12} /> Sabor
                                          </button>
                                        </div>
                                        <div className="space-y-2">
                                          {product.flavors.map((flavor, idx) => {
                                            const flavorName = typeof flavor === 'string' ? flavor : flavor.name;
                                            const flavorAvailable = typeof flavor === 'string' ? true : flavor.available;
                                            
                                            return (
                                              <div key={idx} className="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-lg border border-white/5">
                                                <input 
                                                  type="text" 
                                                  value={flavorName}
                                                  onChange={(e) => updateFlavor(product.id, idx, e.target.value)}
                                                  className={`flex-grow bg-transparent text-sm focus:outline-none ${!flavorAvailable ? 'text-zinc-500 line-through' : ''}`}
                                                />
                                                <div className="flex items-center gap-4">
                                                  <button 
                                                    type="button"
                                                    onClick={() => toggleFlavorAvailability(product.id, idx)}
                                                    className={`text-[10px] font-bold px-2 py-1 rounded transition-all ${
                                                      flavorAvailable 
                                                        ? 'bg-primary/10 text-primary hover:bg-primary/20' 
                                                        : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                                                    }`}
                                                  >
                                                    {flavorAvailable ? 'DISPONÍVEL' : 'INDISPONÍVEL'}
                                                  </button>
                                                  <button 
                                                    type="button"
                                                    onClick={() => removeFlavor(product.id, idx)}
                                                    className="text-red-500/50 hover:text-red-500 transition-colors p-1"
                                                  >
                                                    <Trash2 size={14} />
                                                  </button>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))}
                            <button 
                              type="button"
                              onClick={() => addProduct(brand)}
                              className="w-full py-4 border-2 border-dashed border-white/5 rounded-xl text-zinc-500 hover:text-white hover:border-white/10 transition-all flex items-center justify-center gap-2 text-sm font-bold"
                            >
                              <Plus size={18} /> Adicionar Produto
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                {isAddingBrand ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900/50 border border-primary/30 rounded-2xl p-6 flex flex-col gap-4"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nome da Nova Linha</label>
                      <input 
                        autoFocus
                        type="text"
                        placeholder="Ex: IGNITE, ELF BAR, OXBAR..."
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-primary transition-all"
                        value={newBrandName}
                        onChange={(e) => setNewBrandName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') confirmAddBrand();
                          if (e.key === 'Escape') setIsAddingBrand(false);
                        }}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button 
                        type="button"
                        onClick={confirmAddBrand}
                        className="flex-grow bg-primary text-black py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-primary-hover transition-all active:scale-95"
                      >
                        Confirmar
                      </button>
                      <button 
                        type="button"
                        onClick={() => { setIsAddingBrand(false); setNewBrandName(''); }}
                        className="px-8 bg-zinc-800 text-white py-4 rounded-xl font-bold text-sm hover:bg-zinc-700 transition-all active:scale-95"
                      >
                        Cancelar
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <button 
                    type="button"
                    onClick={addBrand}
                    className="w-full py-4 bg-primary/5 border border-primary/20 rounded-xl text-primary hover:bg-primary/10 transition-all flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest"
                  >
                    <Plus size={18} /> Adicionar Linha de Produtos
                  </button>
                )}
              </div>
            )}

            {activeTab === 'configuracoes' && (
              <div className="space-y-6">
                <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-8">
                  <h3 className="text-lg font-bold mb-4">Gerenciar Dados</h3>
                  <p className="text-zinc-400 text-sm mb-6">
                    Se você já tem um arquivo <code className="text-primary">products.json</code> com alterações, você pode importá-lo aqui ou baixar a versão atual.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button 
                      type="button"
                      onClick={() => {
                        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localProducts, null, 2));
                        const downloadAnchorNode = document.createElement('a');
                        downloadAnchorNode.setAttribute("href",     dataStr);
                        downloadAnchorNode.setAttribute("download", "products.json");
                        document.body.appendChild(downloadAnchorNode);
                        downloadAnchorNode.click();
                        downloadAnchorNode.remove();
                      }}
                      className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-xl font-bold transition-all"
                    >
                      <Package size={18} /> Baixar products.json
                    </button>

                    <label className="flex items-center gap-2 bg-primary text-black px-6 py-3 rounded-xl font-bold hover:bg-primary-hover transition-all cursor-pointer">
                      <Upload size={18} /> Importar products.json
                      <input 
                        type="file" 
                        accept=".json" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImportJSON(file);
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-8 text-center">
                  <p className="text-zinc-500">Configurações adicionais em breve.</p>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                  <AlertTriangle size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Tem certeza?</h3>
                  <p className="text-zinc-400 text-sm">
                    {confirmDelete.type === 'brand' 
                      ? `Isso removerá toda a linha ${confirmDelete.id} e todos os seus produtos.`
                      : 'Este produto será removido permanentemente do catálogo.'}
                  </p>
                </div>
                <div className="flex gap-3 w-full mt-4">
                  <button 
                    type="button"
                    onClick={() => confirmDelete.type === 'brand' ? removeBrand(confirmDelete.id) : removeProduct(confirmDelete.id)}
                    className="flex-grow bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold transition-all"
                  >
                    Sim, Remover
                  </button>
                  <button 
                    type="button"
                    onClick={() => setConfirmDelete(null)}
                    className="flex-grow bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl font-bold transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-8 right-8 text-right pointer-events-none">
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
          Ativar o Windows
          <br />
          Acesse Configurações para ativar o Windows.
        </p>
      </div>
    </div>
  );
}
