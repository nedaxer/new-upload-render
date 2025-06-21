export interface CryptoPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  name: string;
  tradingViewSymbol: string;
  coinGeckoId?: string;
  price?: number;
  change?: number;
}

export const CRYPTO_PAIRS: CryptoPair[] = [
  // Major Pairs
  { symbol: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USDT', name: 'Bitcoin', tradingViewSymbol: 'BYBIT:BTCUSDT', coinGeckoId: 'bitcoin' },
  { symbol: 'ETHUSDT', baseAsset: 'ETH', quoteAsset: 'USDT', name: 'Ethereum', tradingViewSymbol: 'BYBIT:ETHUSDT', coinGeckoId: 'ethereum' },
  { symbol: 'SOLUSDT', baseAsset: 'SOL', quoteAsset: 'USDT', name: 'Solana', tradingViewSymbol: 'BYBIT:SOLUSDT', coinGeckoId: 'solana' },
  { symbol: 'XRPUSDT', baseAsset: 'XRP', quoteAsset: 'USDT', name: 'XRP', tradingViewSymbol: 'BYBIT:XRPUSDT', coinGeckoId: 'ripple' },
  { symbol: 'DOGEUSDT', baseAsset: 'DOGE', quoteAsset: 'USDT', name: 'Dogecoin', tradingViewSymbol: 'BYBIT:DOGEUSDT', coinGeckoId: 'dogecoin' },
  { symbol: 'ADAUSDT', baseAsset: 'ADA', quoteAsset: 'USDT', name: 'Cardano', tradingViewSymbol: 'BYBIT:ADAUSDT', coinGeckoId: 'cardano' },
  { symbol: 'BNBUSDT', baseAsset: 'BNB', quoteAsset: 'USDT', name: 'BNB', tradingViewSymbol: 'BYBIT:BNBUSDT', coinGeckoId: 'binancecoin' },
  { symbol: 'LTCUSDT', baseAsset: 'LTC', quoteAsset: 'USDT', name: 'Litecoin', tradingViewSymbol: 'BYBIT:LTCUSDT', coinGeckoId: 'litecoin' },
  { symbol: 'DOTUSDT', baseAsset: 'DOT', quoteAsset: 'USDT', name: 'Polkadot', tradingViewSymbol: 'BYBIT:DOTUSDT', coinGeckoId: 'polkadot' },
  { symbol: 'AVAXUSDT', baseAsset: 'AVAX', quoteAsset: 'USDT', name: 'Avalanche', tradingViewSymbol: 'BYBIT:AVAXUSDT', coinGeckoId: 'avalanche-2' },
  
  // Popular Altcoins
  { symbol: 'MATICUSDT', baseAsset: 'MATIC', quoteAsset: 'USDT', name: 'Polygon', tradingViewSymbol: 'BYBIT:MATICUSDT', coinGeckoId: 'matic-network' },
  { symbol: 'LINKUSDT', baseAsset: 'LINK', quoteAsset: 'USDT', name: 'Chainlink', tradingViewSymbol: 'BYBIT:LINKUSDT', coinGeckoId: 'chainlink' },
  { symbol: 'UNIUSDT', baseAsset: 'UNI', quoteAsset: 'USDT', name: 'Uniswap', tradingViewSymbol: 'BYBIT:UNIUSDT', coinGeckoId: 'uniswap' },
  { symbol: 'BCHUSDT', baseAsset: 'BCH', quoteAsset: 'USDT', name: 'Bitcoin Cash', tradingViewSymbol: 'BYBIT:BCHUSDT', coinGeckoId: 'bitcoin-cash' },
  { symbol: 'TRXUSDT', baseAsset: 'TRX', quoteAsset: 'USDT', name: 'TRON', tradingViewSymbol: 'BYBIT:TRXUSDT', coinGeckoId: 'tron' },
  { symbol: 'ATOMUSDT', baseAsset: 'ATOM', quoteAsset: 'USDT', name: 'Cosmos', tradingViewSymbol: 'BYBIT:ATOMUSDT', coinGeckoId: 'cosmos' },
  { symbol: 'NEARUSDT', baseAsset: 'NEAR', quoteAsset: 'USDT', name: 'NEAR Protocol', tradingViewSymbol: 'BYBIT:NEARUSDT', coinGeckoId: 'near' },
  { symbol: 'FTMUSDT', baseAsset: 'FTM', quoteAsset: 'USDT', name: 'Fantom', tradingViewSymbol: 'BYBIT:FTMUSDT', coinGeckoId: 'fantom' },
  { symbol: 'ARBUSDT', baseAsset: 'ARB', quoteAsset: 'USDT', name: 'Arbitrum', tradingViewSymbol: 'BYBIT:ARBUSDT', coinGeckoId: 'arbitrum' },
  { symbol: 'OPUSDT', baseAsset: 'OP', quoteAsset: 'USDT', name: 'Optimism', tradingViewSymbol: 'BYBIT:OPUSDT', coinGeckoId: 'optimism' },
  
  // Layer 1s & New Projects
  { symbol: 'APTUSDT', baseAsset: 'APT', quoteAsset: 'USDT', name: 'Aptos', tradingViewSymbol: 'BYBIT:APTUSDT', coinGeckoId: 'aptos' },
  { symbol: 'PEPEUSDT', baseAsset: 'PEPE', quoteAsset: 'USDT', name: 'Pepe', tradingViewSymbol: 'BYBIT:PEPEUSDT', coinGeckoId: 'pepe' },
  { symbol: 'SHIBUSDT', baseAsset: 'SHIB', quoteAsset: 'USDT', name: 'Shiba Inu', tradingViewSymbol: 'BYBIT:SHIBUSDT', coinGeckoId: 'shiba-inu' },
  { symbol: 'WIFUSDT', baseAsset: 'WIF', quoteAsset: 'USDT', name: 'dogwifhat', tradingViewSymbol: 'BYBIT:WIFUSDT', coinGeckoId: 'dogwifcoin' },
  { symbol: 'BONKUSDT', baseAsset: 'BONK', quoteAsset: 'USDT', name: 'Bonk', tradingViewSymbol: 'BYBIT:BONKUSDT', coinGeckoId: 'bonk' },
  { symbol: 'MNTUSDT', baseAsset: 'MNT', quoteAsset: 'USDT', name: 'Mantle', tradingViewSymbol: 'BYBIT:MNTUSDT', coinGeckoId: 'mantle' },
  { symbol: 'SUIUSDT', baseAsset: 'SUI', quoteAsset: 'USDT', name: 'Sui', tradingViewSymbol: 'BYBIT:SUIUSDT', coinGeckoId: 'sui' },
  { symbol: 'SEIUSDT', baseAsset: 'SEI', quoteAsset: 'USDT', name: 'Sei', tradingViewSymbol: 'BYBIT:SEIUSDT', coinGeckoId: 'sei-network' },
  { symbol: 'APEUSDT', baseAsset: 'APE', quoteAsset: 'USDT', name: 'ApeCoin', tradingViewSymbol: 'BYBIT:APEUSDT', coinGeckoId: 'apecoin' },
  { symbol: 'DYDXUSDT', baseAsset: 'DYDX', quoteAsset: 'USDT', name: 'dYdX', tradingViewSymbol: 'BYBIT:DYDXUSDT', coinGeckoId: 'dydx' },
  
  // Meme Coins & Others
  { symbol: 'FLOKIUSDT', baseAsset: 'FLOKI', quoteAsset: 'USDT', name: 'Floki', tradingViewSymbol: 'BYBIT:FLOKIUSDT', coinGeckoId: 'floki' },
  { symbol: 'INJUSDT', baseAsset: 'INJ', quoteAsset: 'USDT', name: 'Injective', tradingViewSymbol: 'BYBIT:INJUSDT', coinGeckoId: 'injective-protocol' },
  { symbol: 'RNDRUSDT', baseAsset: 'RNDR', quoteAsset: 'USDT', name: 'Render', tradingViewSymbol: 'BYBIT:RNDRUSDT', coinGeckoId: 'render-token' },
  { symbol: 'IMXUSDT', baseAsset: 'IMX', quoteAsset: 'USDT', name: 'Immutable X', tradingViewSymbol: 'BYBIT:IMXUSDT', coinGeckoId: 'immutable-x' },
  { symbol: 'GMTUSDT', baseAsset: 'GMT', quoteAsset: 'USDT', name: 'STEPN', tradingViewSymbol: 'BYBIT:GMTUSDT', coinGeckoId: 'stepn' },
  { symbol: 'ENSUSDT', baseAsset: 'ENS', quoteAsset: 'USDT', name: 'Ethereum Name Service', tradingViewSymbol: 'BYBIT:ENSUSDT', coinGeckoId: 'ethereum-name-service' },
  { symbol: 'FETUSDT', baseAsset: 'FET', quoteAsset: 'USDT', name: 'Fetch.ai', tradingViewSymbol: 'BYBIT:FETUSDT', coinGeckoId: 'fetch-ai' },
  { symbol: 'GRTUSDT', baseAsset: 'GRT', quoteAsset: 'USDT', name: 'The Graph', tradingViewSymbol: 'BYBIT:GRTUSDT', coinGeckoId: 'the-graph' },
  { symbol: 'SANDUSDT', baseAsset: 'SAND', quoteAsset: 'USDT', name: 'The Sandbox', tradingViewSymbol: 'BYBIT:SANDUSDT', coinGeckoId: 'the-sandbox' },
  { symbol: 'MANAUSDT', baseAsset: 'MANA', quoteAsset: 'USDT', name: 'Decentraland', tradingViewSymbol: 'BYBIT:MANAUSDT', coinGeckoId: 'decentraland' },
  
  // Gaming & NFT Tokens
  { symbol: 'AXSUSDT', baseAsset: 'AXS', quoteAsset: 'USDT', name: 'Axie Infinity', tradingViewSymbol: 'BYBIT:AXSUSDT', coinGeckoId: 'axie-infinity' },
  { symbol: 'FILUSDT', baseAsset: 'FIL', quoteAsset: 'USDT', name: 'Filecoin', tradingViewSymbol: 'BYBIT:FILUSDT', coinGeckoId: 'filecoin' },
  { symbol: 'ETCUSDT', baseAsset: 'ETC', quoteAsset: 'USDT', name: 'Ethereum Classic', tradingViewSymbol: 'BYBIT:ETCUSDT', coinGeckoId: 'ethereum-classic' },
  { symbol: 'ZECUSDT', baseAsset: 'ZEC', quoteAsset: 'USDT', name: 'Zcash', tradingViewSymbol: 'BYBIT:ZECUSDT', coinGeckoId: 'zcash' },
  { symbol: 'EOSUSDT', baseAsset: 'EOS', quoteAsset: 'USDT', name: 'EOS', tradingViewSymbol: 'BYBIT:EOSUSDT', coinGeckoId: 'eos' },
  { symbol: 'XLMUSDT', baseAsset: 'XLM', quoteAsset: 'USDT', name: 'Stellar', tradingViewSymbol: 'BYBIT:XLMUSDT', coinGeckoId: 'stellar' },
  { symbol: 'ALGOUSDT', baseAsset: 'ALGO', quoteAsset: 'USDT', name: 'Algorand', tradingViewSymbol: 'BYBIT:ALGOUSDT', coinGeckoId: 'algorand' },
  { symbol: 'VETUSDT', baseAsset: 'VET', quoteAsset: 'USDT', name: 'VeChain', tradingViewSymbol: 'BYBIT:VETUSDT', coinGeckoId: 'vechain' },
  { symbol: 'QNTUSDT', baseAsset: 'QNT', quoteAsset: 'USDT', name: 'Quant', tradingViewSymbol: 'BYBIT:QNTUSDT', coinGeckoId: 'quant-network' },
  { symbol: 'ICPUSDT', baseAsset: 'ICP', quoteAsset: 'USDT', name: 'Internet Computer', tradingViewSymbol: 'BYBIT:ICPUSDT', coinGeckoId: 'internet-computer' },
  
  // DeFi Tokens
  { symbol: 'GALAUSDT', baseAsset: 'GALA', quoteAsset: 'USDT', name: 'Gala', tradingViewSymbol: 'BYBIT:GALAUSDT', coinGeckoId: 'gala' },
  { symbol: 'CHZUSDT', baseAsset: 'CHZ', quoteAsset: 'USDT', name: 'Chiliz', tradingViewSymbol: 'BYBIT:CHZUSDT', coinGeckoId: 'chiliz' },
  { symbol: 'CRVUSDT', baseAsset: 'CRV', quoteAsset: 'USDT', name: 'Curve DAO', tradingViewSymbol: 'BYBIT:CRVUSDT', coinGeckoId: 'curve-dao-token' },
  { symbol: 'AAVEUSDT', baseAsset: 'AAVE', quoteAsset: 'USDT', name: 'Aave', tradingViewSymbol: 'BYBIT:AAVEUSDT', coinGeckoId: 'aave' },
  { symbol: 'COMPUSDT', baseAsset: 'COMP', quoteAsset: 'USDT', name: 'Compound', tradingViewSymbol: 'BYBIT:COMPUSDT', coinGeckoId: 'compound-governance-token' },
  { symbol: 'MKRUSDT', baseAsset: 'MKR', quoteAsset: 'USDT', name: 'Maker', tradingViewSymbol: 'BYBIT:MKRUSDT', coinGeckoId: 'maker' },
  { symbol: 'SUSHIUSDT', baseAsset: 'SUSHI', quoteAsset: 'USDT', name: 'SushiSwap', tradingViewSymbol: 'BYBIT:SUSHIUSDT', coinGeckoId: 'sushi' },
  { symbol: 'YFIUSDT', baseAsset: 'YFI', quoteAsset: 'USDT', name: 'yearn.finance', tradingViewSymbol: 'BYBIT:YFIUSDT', coinGeckoId: 'yearn-finance' },
  { symbol: 'SNXUSDT', baseAsset: 'SNX', quoteAsset: 'USDT', name: 'Synthetix', tradingViewSymbol: 'BYBIT:SNXUSDT', coinGeckoId: 'havven' },
  { symbol: 'KSMUSDT', baseAsset: 'KSM', quoteAsset: 'USDT', name: 'Kusama', tradingViewSymbol: 'BYBIT:KSMUSDT', coinGeckoId: 'kusama' },
  
  // New and Trending
  { symbol: 'ONDOUSDT', baseAsset: 'ONDO', quoteAsset: 'USDT', name: 'Ondo', tradingViewSymbol: 'BYBIT:ONDOUSDT', coinGeckoId: 'ondo-finance' },
  { symbol: 'ENAUSDT', baseAsset: 'ENA', quoteAsset: 'USDT', name: 'Ethena', tradingViewSymbol: 'BYBIT:ENAUSDT', coinGeckoId: 'ethena' },
  { symbol: 'JTOUSDT', baseAsset: 'JTO', quoteAsset: 'USDT', name: 'Jito', tradingViewSymbol: 'BYBIT:JTOUSDT', coinGeckoId: 'jito-governance-token' },
  { symbol: 'JUPUSDT', baseAsset: 'JUP', quoteAsset: 'USDT', name: 'Jupiter', tradingViewSymbol: 'BYBIT:JUPUSDT', coinGeckoId: 'jupiter-exchange-solana' },
  { symbol: 'ETHFIUSDT', baseAsset: 'ETHFI', quoteAsset: 'USDT', name: 'Ether.fi', tradingViewSymbol: 'BYBIT:ETHFIUSDT', coinGeckoId: 'ether-fi' },
  { symbol: 'ZETAUSDT', baseAsset: 'ZETA', quoteAsset: 'USDT', name: 'ZetaChain', tradingViewSymbol: 'BYBIT:ZETAUSDT', coinGeckoId: 'zetachain' },
  { symbol: 'PYTHUSDT', baseAsset: 'PYTH', quoteAsset: 'USDT', name: 'Pyth Network', tradingViewSymbol: 'BYBIT:PYTHUSDT', coinGeckoId: 'pyth-network' },
  { symbol: 'TIAUSDT', baseAsset: 'TIA', quoteAsset: 'USDT', name: 'Celestia', tradingViewSymbol: 'BYBIT:TIAUSDT', coinGeckoId: 'celestia' },
  { symbol: 'STRKUSDT', baseAsset: 'STRK', quoteAsset: 'USDT', name: 'Starknet', tradingViewSymbol: 'BYBIT:STRKUSDT', coinGeckoId: 'starknet' },
  { symbol: 'ARKMUSDT', baseAsset: 'ARKM', quoteAsset: 'USDT', name: 'Arkham', tradingViewSymbol: 'BYBIT:ARKMUSDT', coinGeckoId: 'arkham' },
  { symbol: 'AXLUSDT', baseAsset: 'AXL', quoteAsset: 'USDT', name: 'Axelar', tradingViewSymbol: 'BYBIT:AXLUSDT', coinGeckoId: 'axelar' },
  { symbol: 'WUSDT', baseAsset: 'W', quoteAsset: 'USDT', name: 'Wormhole', tradingViewSymbol: 'BYBIT:WUSDT', coinGeckoId: 'wormhole' },
  
  // Additional Popular Tokens
  { symbol: 'COREUSDT', baseAsset: 'CORE', quoteAsset: 'USDT', name: 'Core', tradingViewSymbol: 'BYBIT:COREUSDT', coinGeckoId: 'coredaoorg' },
  { symbol: 'MINAUSDT', baseAsset: 'MINA', quoteAsset: 'USDT', name: 'Mina Protocol', tradingViewSymbol: 'BYBIT:MINAUSDT', coinGeckoId: 'mina-protocol' },
  { symbol: 'CKBUSDT', baseAsset: 'CKB', quoteAsset: 'USDT', name: 'Nervos Network', tradingViewSymbol: 'BYBIT:CKBUSDT', coinGeckoId: 'nervos-network' },
  { symbol: 'SATSUSDT', baseAsset: 'SATS', quoteAsset: 'USDT', name: '1000SATS', tradingViewSymbol: 'BYBIT:1000SATSUSDT', coinGeckoId: '1000sats' },
  { symbol: 'ORDIUSDT', baseAsset: 'ORDI', quoteAsset: 'USDT', name: 'ORDI', tradingViewSymbol: 'BYBIT:ORDIUSDT', coinGeckoId: 'ordinals' },
  { symbol: 'BOMEUSDT', baseAsset: 'BOME', quoteAsset: 'USDT', name: 'BOOK OF MEME', tradingViewSymbol: 'BYBIT:BOMEUSDT', coinGeckoId: 'book-of-meme' },
  { symbol: 'DEGENUSDT', baseAsset: 'DEGEN', quoteAsset: 'USDT', name: 'Degen', tradingViewSymbol: 'BYBIT:DEGENUSDT', coinGeckoId: 'degen-base' },
  { symbol: 'TRUMPUSDT', baseAsset: 'TRUMP', quoteAsset: 'USDT', name: 'MAGA', tradingViewSymbol: 'BYBIT:TRUMPUSDT', coinGeckoId: 'maga' },
  { symbol: 'SPXUSDT', baseAsset: 'SPX', quoteAsset: 'USDT', name: 'SPX6900', tradingViewSymbol: 'BYBIT:SPXUSDT', coinGeckoId: 'spx6900' },
  { symbol: 'SOSOUSDT', baseAsset: 'SOSO', quoteAsset: 'USDT', name: 'SoSo Value', tradingViewSymbol: 'BYBIT:SOSOUSDT', coinGeckoId: 'sosostocks' },
  { symbol: 'HOMEUSDT', baseAsset: 'HOME', quoteAsset: 'USDT', name: 'HOME', tradingViewSymbol: 'BYBIT:HOMEUSDT', coinGeckoId: 'home' },
  { symbol: 'USDEUSDT', baseAsset: 'USDE', quoteAsset: 'USDT', name: 'Ethena USDe', tradingViewSymbol: 'BYBIT:USDEUSDT', coinGeckoId: 'ethena-usde' },
  { symbol: 'DRIFTUSDT', baseAsset: 'DRIFT', quoteAsset: 'USDT', name: 'Drift Protocol', tradingViewSymbol: 'BYBIT:DRIFTUSDT', coinGeckoId: 'drift-protocol' },
  { symbol: 'DYMUSDT', baseAsset: 'DYM', quoteAsset: 'USDT', name: 'Dymension', tradingViewSymbol: 'BYBIT:DYMUSDT', coinGeckoId: 'dymension' },
  { symbol: 'EGLDUSDT', baseAsset: 'EGLD', quoteAsset: 'USDT', name: 'MultiversX', tradingViewSymbol: 'BYBIT:EGLDUSDT', coinGeckoId: 'elrond-erd-2' },
  { symbol: 'EIGENUSDT', baseAsset: 'EIGEN', quoteAsset: 'USDT', name: 'EigenLayer', tradingViewSymbol: 'BYBIT:EIGENUSDT', coinGeckoId: 'eigenlayer' },
  { symbol: 'ENJUSDT', baseAsset: 'ENJ', quoteAsset: 'USDT', name: 'Enjin Coin', tradingViewSymbol: 'BYBIT:ENJUSDT', coinGeckoId: 'enjincoin' },
  { symbol: 'ETHWUSDT', baseAsset: 'ETHW', quoteAsset: 'USDT', name: 'EthereumPoW', tradingViewSymbol: 'BYBIT:ETHWUSDT', coinGeckoId: 'ethereum-pow-iou' },
  { symbol: 'FIDAUSDT', baseAsset: 'FIDA', quoteAsset: 'USDT', name: 'Bonfida', tradingViewSymbol: 'BYBIT:FIDAUSDT', coinGeckoId: 'bonfida' },
  { symbol: 'FLOWUSDT', baseAsset: 'FLOW', quoteAsset: 'USDT', name: 'Flow', tradingViewSymbol: 'BYBIT:FLOWUSDT', coinGeckoId: 'flow' },
  { symbol: 'FLRUSDT', baseAsset: 'FLR', quoteAsset: 'USDT', name: 'Flare', tradingViewSymbol: 'BYBIT:FLRUSDT', coinGeckoId: 'flare-networks' },
  { symbol: 'FXSUSDT', baseAsset: 'FXS', quoteAsset: 'USDT', name: 'Frax Share', tradingViewSymbol: 'BYBIT:FXSUSDT', coinGeckoId: 'frax-share' },
  { symbol: 'GMXUSDT', baseAsset: 'GMX', quoteAsset: 'USDT', name: 'GMX', tradingViewSymbol: 'BYBIT:GMXUSDT', coinGeckoId: 'gmx' },
  { symbol: 'GOATUSDT', baseAsset: 'GOAT', quoteAsset: 'USDT', name: 'Goatseus Maximus', tradingViewSymbol: 'BYBIT:GOATUSDT', coinGeckoId: 'goatseus-maximus' },
  { symbol: 'GPSUSDT', baseAsset: 'GPS', quoteAsset: 'USDT', name: 'GPS', tradingViewSymbol: 'BYBIT:GPSUSDT', coinGeckoId: 'gps' },
  { symbol: 'GRASSUSDT', baseAsset: 'GRASS', quoteAsset: 'USDT', name: 'Grass', tradingViewSymbol: 'BYBIT:GRASSUSDT', coinGeckoId: 'grass' },
  { symbol: 'IOUSDT', baseAsset: 'IO', quoteAsset: 'USDT', name: 'io.net', tradingViewSymbol: 'BYBIT:IOUSDT', coinGeckoId: 'io' },
  { symbol: 'IPUSDT', baseAsset: 'IP', quoteAsset: 'USDT', name: 'IP', tradingViewSymbol: 'BYBIT:IPUSDT', coinGeckoId: 'ip' },
  { symbol: 'JASMYUSDT', baseAsset: 'JASMY', quoteAsset: 'USDT', name: 'JasmyCoin', tradingViewSymbol: 'BYBIT:JASMYUSDT', coinGeckoId: 'jasmycoin' },
  { symbol: 'KASUSDT', baseAsset: 'KAS', quoteAsset: 'USDT', name: 'Kaspa', tradingViewSymbol: 'BYBIT:KASUSDT', coinGeckoId: 'kaspa' },
  { symbol: 'KAVAUSDT', baseAsset: 'KAVA', quoteAsset: 'USDT', name: 'Kava', tradingViewSymbol: 'BYBIT:KAVAUSDT', coinGeckoId: 'kava' },
  { symbol: 'KDAUSDT', baseAsset: 'KDA', quoteAsset: 'USDT', name: 'Kadena', tradingViewSymbol: 'BYBIT:KDAUSDT', coinGeckoId: 'kadena' },
  { symbol: 'KMNOUSDT', baseAsset: 'KMNO', quoteAsset: 'USDT', name: 'Komano', tradingViewSymbol: 'BYBIT:KMNOUSDT', coinGeckoId: 'komano' },
  { symbol: 'ANKRUSDT', baseAsset: 'ANKR', quoteAsset: 'USDT', name: 'Ankr', tradingViewSymbol: 'BYBIT:ANKRUSDT', coinGeckoId: 'ankr' },
  { symbol: 'BATUSDT', baseAsset: 'BAT', quoteAsset: 'USDT', name: 'Basic Attention Token', tradingViewSymbol: 'BYBIT:BATUSDT', coinGeckoId: 'basic-attention-token' },
  { symbol: 'CELOUSDT', baseAsset: 'CELO', quoteAsset: 'USDT', name: 'Celo', tradingViewSymbol: 'BYBIT:CELOUSDT', coinGeckoId: 'celo' }
];

// Helper functions
export const findPairBySymbol = (symbol: string): CryptoPair | undefined => {
  return CRYPTO_PAIRS.find(pair => pair.symbol === symbol);
};

export const findPairByBaseAsset = (baseAsset: string): CryptoPair | undefined => {
  return CRYPTO_PAIRS.find(pair => pair.baseAsset === baseAsset);
};

export const getPairDisplayName = (pair: CryptoPair): string => {
  return `${pair.baseAsset}/${pair.quoteAsset}`;
};

export const getPairTradingViewSymbol = (symbol: string): string => {
  const pair = findPairBySymbol(symbol);
  return pair?.tradingViewSymbol || `BYBIT:${symbol}`;
};

export const getCryptoName = (symbol: string): string => {
  const pair = findPairByBaseAsset(symbol);
  return pair?.name || symbol;
};