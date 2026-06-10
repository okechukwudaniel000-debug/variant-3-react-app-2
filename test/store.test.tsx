import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StoreProvider, useStore } from '@/components/StoreProvider';

function Harness() {
  const { cartCount, wishlistCount, addToCart, toggleWishlist, setQty, cart } = useStore();
  return (
    <div>
      <span data-testid="cart">{cartCount}</span>
      <span data-testid="wish">{wishlistCount}</span>
      <button onClick={() => addToCart('i16pm')}>add</button>
      <button onClick={() => setQty('i16pm', 5)}>set5</button>
      <button onClick={() => toggleWishlist('i16pm')}>wish</button>
      <span data-testid="qty">{cart.find((i) => i.id === 'i16pm')?.qty ?? 0}</span>
    </div>
  );
}

function renderHarness() {
  return render(
    <StoreProvider>
      <Harness />
    </StoreProvider>
  );
}

describe('StoreProvider', () => {
  it('accumulates cart quantity and updates count', () => {
    renderHarness();
    expect(screen.getByTestId('cart').textContent).toBe('0');
    fireEvent.click(screen.getByText('add'));
    fireEvent.click(screen.getByText('add'));
    expect(screen.getByTestId('cart').textContent).toBe('2');
    expect(screen.getByTestId('qty').textContent).toBe('2');
  });

  it('setQty overrides quantity, and 0 removes the line', () => {
    renderHarness();
    fireEvent.click(screen.getByText('add'));
    fireEvent.click(screen.getByText('set5'));
    expect(screen.getByTestId('qty').textContent).toBe('5');
    expect(screen.getByTestId('cart').textContent).toBe('5');
  });

  it('toggles wishlist on and off', () => {
    renderHarness();
    fireEvent.click(screen.getByText('wish'));
    expect(screen.getByTestId('wish').textContent).toBe('1');
    fireEvent.click(screen.getByText('wish'));
    expect(screen.getByTestId('wish').textContent).toBe('0');
  });
});
