
interface TokenIconProps {
  symbol: string;
  size?: number;
}

export default function TokenIconComponent({ symbol, size = 24 }: TokenIconProps) {
  // نمایش حرف اول ارز به جای آیکون (تا زمان نصب کتابخانه اصلی)
  return (
    <div
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${getColor(symbol)}, ${getColor(symbol)}88)`,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.4,
        fontWeight: 'bold',
        color: 'white',
      }}
    >
      {symbol.slice(0, 1)}
    </div>
  );
}

function getColor(symbol: string): string {
  const colors: Record<string, string> = {
    USDT: '#26A17B',
    USDC: '#2775CA',
    TON: '#0098EA',
    BTC: '#F7931A',
    ETH: '#627EEA',
    GRAM: '#0098EA',
    SOL: '#9945FF',
  };
  return colors[symbol] || '#7C3AED';
}
