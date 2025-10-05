import React, { useState } from 'react';
import Header from '../../../components/header';
import MenuLateral from '../../../components/menuLateral';
import './index.css';
import MenuLateralCliente from '../../../components/menuLateralCliente';

export default function ProductPage() {
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const price = 199.99;
  const shipping = 15.00;
  const subtotal = price * quantity;
  const total = subtotal + shipping;

  const images = [0, 1, 2, 3];

  function handleDecrement() {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  }

  function handleIncrement() {
    setQuantity(quantity + 1);
  }

  function handlePrevImage() {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }

  function handleNextImage() {
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }

  return (
    <div className="admin-layout">
      <Header nome={"Visualizar Produto"} />
      <div className="admin-content">
        <MenuLateralCliente />
        <div className="product-content">
          <div className="product-section">
            <div className="main-image">
              <div className="mouse-image"></div>
            </div>

            <div className="thumbnail-section">
              <button className="thumbnail-nav" onClick={handlePrevImage}>‹</button>
              <div className="thumbnails">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <div className="thumbnail-mouse"></div>
                  </div>
                ))}
              </div>
              <button className="thumbnail-nav" onClick={handleNextImage}>›</button>
            </div>
          </div>

          <div className="info-section">
            <h1 className="product-title">Mouse Gamer XYZ Pro</h1>
            
            <div className="rating">
              <span className="stars">★★★★★</span>
              <span className="review-count">(34)</span>
            </div>

            <div className="price">R$ {price.toFixed(2).replace('.', ',')}</div>

            <p className="description">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
              incididunt ut labore et dolore magna.
            </p>

            <div className="quantity-section">
              <button className="quantity-btn" onClick={handleDecrement}>−</button>
              <span className="quantity-display">{quantity}</span>
              <button className="quantity-btn" onClick={handleIncrement}>+</button>
            </div>

            <button className="add-to-cart-btn">Adicionar ao Carrinho</button>
          </div>

          

           

           

            

            
          
          </div>
        </div>
      </div>
   
  );
}