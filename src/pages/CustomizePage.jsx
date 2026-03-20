import { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import Header from '../components/Header';
import { getProductById } from '../constants/products';
import useCustomStore from '../store/useCustomStore';
import ConfiguratorScene from '../components/configurator/ConfiguratorScene';
import { PLACEMENT_ZONES } from '../components/configurator/ConfiguratorShirtModel';
import { COLOR_PALETTE, CATEGORIES, DEFAULT_COLOR_ID } from '../components/configurator/configuratorColors';
import './CustomizePage.css';

/* ── small sub-components ───────────────────────────────── */

function ColorSwatch({ color, isSelected, onClick }) {
  return (
    <button
      className={`cfg-swatch ${isSelected ? 'cfg-swatch--selected' : ''}`}
      onClick={() => onClick(color)}
      title={color.name}
    >
      <span className="cfg-swatch-inner" style={{ background: color.hex }} />
      {isSelected && <span className="cfg-swatch-check">✓</span>}
    </button>
  );
}

function ZoneCard({ zone, isSelected, onClick }) {
  return (
    <button
      className={`cfg-zone-card ${isSelected ? 'cfg-zone-card--selected' : ''}`}
      onClick={() => onClick(zone)}
    >
      <div className="cfg-zone-preview">
        <svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg" className="cfg-zone-svg">
          <path
            d="M18 8 L8 20 L16 23 L16 62 L44 62 L44 23 L52 20 L42 8 L34 12 Q30 14 26 12 Z"
            fill="#2a2520" stroke="#3a3530" strokeWidth="0.8"
          />
          <path d="M18 8 L8 20 L16 23 L18 18 Z" fill="#222" stroke="#3a3530" strokeWidth="0.6" />
          <path d="M42 8 L52 20 L44 23 L42 18 Z" fill="#222" stroke="#3a3530" strokeWidth="0.6" />
          {zone.id === 'left-chest'  && <rect x="18" y="22" width="11" height="9"  fill="#c8a96e" opacity="0.8" rx="1" />}
          {zone.id === 'right-chest' && <rect x="31" y="22" width="11" height="9"  fill="#c8a96e" opacity="0.8" rx="1" />}
          {zone.id === 'left-sleeve' && <rect x="9"  y="13" width="8"  height="8"  fill="#c8a96e" opacity="0.8" rx="1" />}
        </svg>
      </div>
      <span className="cfg-zone-label">{zone.label}</span>
    </button>
  );
}

/* ── main page ──────────────────────────────────────────── */

export default function CustomizePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = getProductById(id);
  const addToCart = useCustomStore(s => s.addToCart);
  const initProduct = useCustomStore(s => s.initProduct);

  // Configurator state (self-contained — doesn't touch useCustomStore colors)
  const [selectedColorId, setSelectedColorId] = useState(DEFAULT_COLOR_ID);
  const [activeCategory, setActiveCategory]   = useState('All');
  const [autoRotate, setAutoRotate]           = useState(false);
  const [isInteracting, setIsInteracting]     = useState(false);
  const [showColorName, setShowColorName]     = useState(false);
  const [activeTab, setActiveTab]             = useState('color');
  const [selectedZoneId, setSelectedZoneId]   = useState(null);
  const [logoTexture, setLogoTexture]         = useState(null);
  const nameTimerRef = useRef(null);

  const selectedColor = COLOR_PALETTE.find(c => c.id === selectedColorId);
  const filteredColors = activeCategory === 'All'
    ? COLOR_PALETTE
    : COLOR_PALETTE.filter(c => c.category === activeCategory);

  // Init product in store on mount
  useEffect(() => {
    if (product) initProduct(product);
  }, [product, initProduct]);

  // Load logo texture (use product thumbnail as logo)
  useEffect(() => {
    if (!product) return;
    const loader = new THREE.TextureLoader();
    loader.load(product.photos[0], (tex) => {
      const image = tex.image;
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      ctx.translate(image.width / 2, image.height / 2);
      ctx.rotate(Math.PI);
      ctx.drawImage(image, -image.width / 2, -image.height / 2);
      const rotatedTex = new THREE.CanvasTexture(canvas);
      rotatedTex.colorSpace = THREE.SRGBColorSpace;
      rotatedTex.needsUpdate = true;
      setLogoTexture(rotatedTex);
    });
  }, [product]);

  const handleColorSelect = useCallback((color) => {
    if (color.id === selectedColorId) return;
    setSelectedColorId(color.id);
    setShowColorName(true);
    clearTimeout(nameTimerRef.current);
    nameTimerRef.current = setTimeout(() => setShowColorName(false), 2200);
  }, [selectedColorId]);

  const handleInteractionChange = useCallback((val) => setIsInteracting(val), []);

  // Keyboard color navigation
  useEffect(() => {
    const handler = (e) => {
      const idx = COLOR_PALETTE.findIndex(c => c.id === selectedColorId);
      if (e.key === 'ArrowRight') handleColorSelect(COLOR_PALETTE[(idx + 1) % COLOR_PALETTE.length]);
      if (e.key === 'ArrowLeft')  handleColorSelect(COLOR_PALETTE[(idx - 1 + COLOR_PALETTE.length) % COLOR_PALETTE.length]);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedColorId, handleColorSelect]);

  const handleZoneSelect = (zone) => {
    setSelectedZoneId(prev => prev === zone.id ? null : zone.id);
  };

  const handleAddToCart = () => {
    addToCart();
    navigate('/cart');
  };

  const selectedZone = PLACEMENT_ZONES.find(z => z.id === selectedZoneId);

  if (!product) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f0ede8' }}>
      <Header />
      <div style={{ textAlign: 'center', paddingTop: 200 }}>
        <h2>Product not found</h2>
        <button onClick={() => navigate('/collection')} style={{ marginTop: 24 }}>
          ← Back to Collection
        </button>
      </div>
    </div>
  );

  return (
    <div className="cfg-page">
      <Header />

      <div className="cfg-body">
        {/* ── LEFT PANEL ── */}
        <aside className="cfg-panel cfg-panel--left">
          <div className="cfg-panel-section">
            <p className="cfg-panel-label">PRODUCT</p>
            <div className="cfg-product-name">{product.shortName}</div>
            <div className="cfg-product-price">${product.basePrice}.00</div>
          </div>

          <div className="cfg-divider" />

          <div className="cfg-panel-section">
            <p className="cfg-panel-label">SPECS</p>
            <div className="cfg-detail-rows">
              {Object.entries(product.specs).map(([k, v]) => (
                <div className="cfg-detail-row" key={k}>
                  <span className="cfg-detail-key">{k.toUpperCase()}</span>
                  <span className="cfg-detail-val">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="cfg-divider" />

          <div className="cfg-panel-section">
            <p className="cfg-panel-label">VIEWER</p>
            <button
              className={`cfg-toggle-btn ${autoRotate ? 'active' : ''}`}
              onClick={() => setAutoRotate(v => !v)}
            >
              <span>{autoRotate ? '⏸' : '▶'}</span>
              <span>{autoRotate ? 'PAUSE' : 'AUTO ROTATE'}</span>
            </button>
            <p className="cfg-hint">Drag to orbit · Scroll to zoom</p>
          </div>

          {selectedZoneId && (
            <>
              <div className="cfg-divider" />
              <div className="cfg-panel-section">
                <p className="cfg-panel-label">ACTIVE PLACEMENT</p>
                <div className="cfg-active-zone">
                  <span className="cfg-active-zone-name">{selectedZone?.label}</span>
                  <button className="cfg-remove-btn" onClick={() => setSelectedZoneId(null)}>✕</button>
                </div>
              </div>
            </>
          )}
        </aside>

        {/* ── VIEWPORT ── */}
        <div className="cfg-viewport">
          <Suspense fallback={null}>
            <ConfiguratorScene
              color={selectedColor?.hex || '#111111'}
              autoRotate={autoRotate && !isInteracting}
              onInteractionChange={handleInteractionChange}
              selectedZoneId={selectedZoneId}
              logoTexture={logoTexture}
            />
          </Suspense>

          {/* Color name toast */}
          <div className={`cfg-toast ${showColorName ? 'cfg-toast--visible' : ''}`}>
            <span className="cfg-toast-swatch" style={{ background: selectedColor?.hex }} />
            <div>
              <div className="cfg-toast-name">{selectedColor?.name}</div>
              <div className="cfg-toast-cat">{selectedColor?.category}</div>
            </div>
          </div>

          {/* Back button */}
          <button
            className="cfg-back-btn"
            onClick={() => navigate(`/product/${product.id}`)}
          >
            ← Back
          </button>
        </div>

        {/* ── RIGHT PANEL ── */}
        <aside className="cfg-panel cfg-panel--right">
          {/* Tabs */}
          <div className="cfg-tabs">
            <button
              className={`cfg-tab ${activeTab === 'color' ? 'cfg-tab--active' : ''}`}
              onClick={() => setActiveTab('color')}
            >COLOR</button>
            <button
              className={`cfg-tab ${activeTab === 'logo' ? 'cfg-tab--active' : ''}`}
              onClick={() => setActiveTab('logo')}
            >LOGO</button>
          </div>

          <div className="cfg-panel-scroll">

            {/* COLOR TAB */}
            {activeTab === 'color' && (
              <>
                <div className="cfg-panel-section">
                  <div className="cfg-selected-color-display">
                    <div className="cfg-selected-preview" style={{ background: selectedColor?.hex }} />
                    <div>
                      <div className="cfg-selected-name">{selectedColor?.name}</div>
                      <div className="cfg-selected-hex">{selectedColor?.hex}</div>
                      <div className="cfg-selected-cat">{selectedColor?.category}</div>
                    </div>
                  </div>
                </div>

                <div className="cfg-cat-tabs">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      className={`cfg-cat-tab ${activeCategory === cat ? 'cfg-cat-tab--active' : ''}`}
                      onClick={() => setActiveCategory(cat)}
                    >
                      {cat === 'Statement' ? 'STATE' : cat.toUpperCase().slice(0, 6)}
                    </button>
                  ))}
                </div>

                <div className="cfg-color-grid-wrap">
                  <div className="cfg-color-grid">
                    {filteredColors.map(color => (
                      <ColorSwatch
                        key={color.id}
                        color={color}
                        isSelected={color.id === selectedColorId}
                        onClick={handleColorSelect}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* LOGO TAB */}
            {activeTab === 'logo' && (
              <div>
                <div className="cfg-panel-section">
                  <p className="cfg-panel-label">PLACEMENT ZONE</p>
                  <p className="cfg-hint" style={{ marginBottom: 12 }}>
                    Select where to place a logo on the shirt
                  </p>
                </div>
                <div className="cfg-zone-grid-wrap">
                  <div className="cfg-zone-grid">
                    {PLACEMENT_ZONES.map(zone => (
                      <ZoneCard
                        key={zone.id}
                        zone={zone}
                        isSelected={selectedZoneId === zone.id}
                        onClick={handleZoneSelect}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="cfg-cta-wrap">
            <div className="cfg-divider" />
            <div className="cfg-panel-section">
              <div className="cfg-price-row">
                <span className="cfg-price">${product.basePrice}.00</span>
                <span className="cfg-free-ship">FREE SHIPPING</span>
              </div>
              <button className="cfg-add-btn" onClick={handleAddToCart}>
                <span>ADD TO CART</span>
                <span>→</span>
              </button>
              <button className="cfg-back-link" onClick={() => navigate(`/product/${product.id}`)}>
                ← Back to Product
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
