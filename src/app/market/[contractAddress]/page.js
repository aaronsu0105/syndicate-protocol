"use client";
import React, { useState, useEffect } from "react";
import { ThirdwebProvider, ConnectWallet, Web3Button, useContract, useContractRead } from "@thirdweb-dev/react";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import { ArrowLeft, Building2, Activity, FileText, Lock, ShieldCheck, MapPin, Info } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const POOL_ABI = [
  { "inputs": [], "name": "invest", "outputs": [], "stateMutability": "payable", "type": "function" },
  { "inputs": [], "name": "assetName", "outputs": [{ "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "fundingGoal", "outputs": [{ "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "totalFunded", "outputs": [{ "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "isClosed", "outputs": [{ "type": "bool" }], "stateMutability": "view", "type": "function" }
];

// ==========================================
// 🌟 THE FRONTEND IMAGE DICTIONARY 🌟
// ==========================================
const ASSET_IMAGES = {
  "0xYourFirstContractAddressHere": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=2000", 
  "0xYourSecondContractAddressHere": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=2000", 
  "default": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2000" 
};

// ==========================================
// 1. THE INNER COMPONENT
// ==========================================
function ProspectusContent({ contractAddress }) {
  const { contract } = useContract(contractAddress, POOL_ABI);
  const { data: assetName, isLoading: nameLoading } = useContractRead(contract, "assetName");
  const { data: fundingGoal } = useContractRead(contract, "fundingGoal");
  const { data: totalFunded, refetch: refetchFunded } = useContractRead(contract, "totalFunded");
  const { data: isClosed, refetch: refetchStatus } = useContractRead(contract, "isClosed");

  const [investAmount, setInvestAmount] = useState("");
  const [ethPrice, setEthPrice] = useState(0);

  // 🌟 NEW: Fetching the Live ETH Price from Binance 🌟
  useEffect(() => {
    fetch("https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT")
      .then(res => res.json())
      .then(data => setEthPrice(parseFloat(data.price)))
      .catch(console.error);
  }, []);

  const ethFunded = parseFloat(ethers.utils.formatEther(totalFunded || "0"));
  const ethGoal = parseFloat(ethers.utils.formatEther(fundingGoal || "0"));
  
  // Prevent division by zero before load
  const progress = Math.min((ethFunded / (ethGoal > 0 ? ethGoal : 1)) * 100, 100) || 0;

  // 🌟 NEW: Live USD Conversions 🌟
  const usdFunded = ethPrice > 0 ? (ethFunded * ethPrice).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : "...";
  const usdGoal = ethPrice > 0 ? (ethGoal * ethPrice).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : "...";

  const imageUrl = ASSET_IMAGES[contractAddress] || ASSET_IMAGES["default"];

  if (nameLoading) return <div className="min-h-screen bg-[#02040a] flex items-center justify-center"><div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-200 font-sans selection:bg-blue-500/30 pb-32">
      <Toaster position="bottom-right" />
      
      {/* Navigation Bar */}
      <nav className="border-b border-white/5 h-24 flex items-center bg-[#0a0b12]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="w-full max-w-7xl mx-auto px-8 flex justify-between items-center">
          <a href="/" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors font-black uppercase tracking-widest text-xs">
            <ArrowLeft className="w-4 h-4" /> Back to Markets
          </a>
          <ConnectWallet theme="dark" className="!bg-white/5 !text-white !font-black !tracking-widest !uppercase !rounded-xl !px-6 !py-3 hover:!bg-white/10 transition-all border border-white/10" />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 mt-16">
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${isClosed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}`}>
                {isClosed ? 'Ledger Closed' : 'Funding Active'}
              </span>
              <span className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2"><MapPin className="w-3 h-3" /> Tier-1 Jurisdiction</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-white uppercase italic tracking-tighter mb-4">{assetName}</h1>
            <p className="text-slate-400 font-mono text-sm break-all bg-white/5 px-4 py-2 rounded-lg inline-block border border-white/10">{contractAddress}</p>
          </div>
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: Details & Due Diligence */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-12">
            
            {/* Dynamic Property Visual */}
            <div className="w-full h-[400px] rounded-[3rem] border border-white/10 relative overflow-hidden flex items-center justify-center shadow-2xl group bg-[#0a0b12]">
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all duration-500 z-10"></div>
              <img 
                src={imageUrl} 
                alt={assetName || "Real Estate Asset"} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-6 left-6 z-20 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
                <p className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400" /> Verified Physical Asset
                </p>
              </div>
            </div>

            {/* Investment Thesis */}
            <div className="bg-[#0a0b12]/80 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem]">
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-6 flex items-center gap-3"><FileText className="text-blue-500 w-6 h-6" /> Investment Thesis</h3>
              <p className="text-slate-400 leading-relaxed font-medium mb-6">
                This Special Purpose Vehicle (SPV) represents fractionalized equity in institutional-grade real estate. The asset has undergone rigorous off-chain legal structuring to ensure on-chain token holders possess direct proportional rights to all generated rental yields and final liquidation profits.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/5">
                <div><p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-1">Asset Class</p><p className="text-white font-bold">Commercial RWA</p></div>
                <div><p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-1">Target Yield</p><p className="text-emerald-400 font-bold">12.4% APY</p></div>
                <div><p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-1">Manager Fee</p><p className="text-white font-bold">20% of Profit</p></div>
                <div><p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-1">Audit Status</p><p className="text-blue-400 font-bold flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> Verified</p></div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Financial Terminal */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-8">
            
            {/* 🌟 UPDATED: Progress & Target Box with Live USD 🌟 */}
            <div className="bg-blue-600/5 border border-blue-500/20 p-8 rounded-[2.5rem] shadow-2xl">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Committed</p>
                  <p className="text-4xl font-black text-white">{ethFunded.toFixed(4)} <span className="text-base text-slate-500 italic">ETH</span></p>
                  <p className="text-emerald-500/80 text-sm font-bold mt-1 tracking-widest">≈ {usdFunded}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Funding Cap</p>
                  <p className="text-xl font-black text-blue-400">{ethGoal.toFixed(4)} <span className="text-xs text-blue-500/50 italic">ETH</span></p>
                  <p className="text-blue-400/60 text-[10px] font-bold mt-1 tracking-widest">≈ {usdGoal}</p>
                </div>
              </div>

              <div className="w-full bg-black/50 h-4 rounded-full overflow-hidden mb-4 shadow-inner border border-white/5">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)]" />
              </div>
              <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest">
                <span>{progress.toFixed(1)}% Filled</span>
                <span>{isClosed ? 'Closed' : 'Accepting Capital'}</span>
              </div>
            </div>

            {/* Action Terminal */}
            <div className="bg-[#0a0b12]/90 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-6 flex items-center gap-3"><Activity className="text-emerald-500 w-5 h-5" /> Execute Commitment</h3>
              
              {isClosed ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl text-center">
                  <Lock className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                  <p className="text-emerald-400 font-black uppercase tracking-widest text-sm">Funding Successfully Closed</p>
                  <p className="text-emerald-500/60 text-xs font-bold mt-2">Asset is currently generating yield.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] ml-4 mb-2 block">Commitment Amount (ETH)</label>
                    <input 
                      type="number" 
                      value={investAmount}
                      onChange={(e) => setInvestAmount(e.target.value)}
                      placeholder="0.05" 
                      className="w-full bg-black/50 border border-white/10 text-white rounded-2xl py-4 px-6 text-lg outline-none focus:border-blue-500 shadow-inner transition-all font-bold placeholder:text-slate-700"
                    />
                  </div>
                  
                  <Web3Button 
                    contractAddress={contractAddress} 
                    contractAbi={POOL_ABI}
                    action={async (contract) => {
                      if (!investAmount) throw new Error("Enter an investment amount");
                      await contract.call("invest", [], { value: ethers.utils.parseEther(investAmount) });
                    }} 
                    onSuccess={() => {
                      toast.success("Capital Committed Successfully!", { style: { background: '#0a0b12', color: '#fff', border: '1px solid rgba(59,130,246,0.5)' }});
                      setInvestAmount("");
                      refetchFunded();
                      refetchStatus();
                    }}
                    className="!w-full !bg-blue-600 !py-4 !rounded-[1.5rem] !font-black !text-lg hover:!bg-blue-500 shadow-2xl transition-all shadow-blue-600/30 uppercase italic"
                  >
                    Sign & Commit Capital
                  </Web3Button>
                  <p className="text-slate-600 text-xs text-center font-medium italic flex items-center justify-center gap-1"><Info className="w-3 h-3" /> Smart contract execution required</p>
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}

// ==========================================
// 2. THE WRAPPER 
// ==========================================
export default function AssetProspectus({ params }) {
  const { contractAddress } = params; 
  return (
    <QueryClientProvider client={queryClient}>
      <ThirdwebProvider activeChain="sepolia" queryClient={queryClient}>
        <ProspectusContent contractAddress={contractAddress} />
      </ThirdwebProvider>
    </QueryClientProvider>
  );
}