import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SearchBar from '../../src/components/SearchBar';

afterEach(cleanup);

describe('SearchBar', () => {
  it.each(['', '   '])('não dispara onSearch para entrada vazia %j', async (value) => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('searchbox', { name: 'Buscar cidade' });

    if (value) await user.type(input, value);

    const button = screen.getByRole('button', { name: 'Buscar' });
    expect(button).toBeDisabled();
    await user.click(button);
    await user.click(input);
    await user.keyboard('{Enter}');

    expect(onSearch).not.toHaveBeenCalled();
  });

  it.each([
    'Berlin',
    'São Paulo',
    "L'Haÿ-les-Roses",
  ])('dispara onSearch com o termo %s sem espaços externos', async (term) => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByLabelText('Buscar cidade'), `  ${term}  `);
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).toHaveBeenCalledExactlyOnceWith(term);
  });

  it('envia um termo válido usando Enter', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'Berlin{Enter}');

    expect(onSearch).toHaveBeenCalledExactlyOnceWith('Berlin');
  });

  it('não permite envio enquanto está desabilitada', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    const { rerender } = render(<SearchBar onSearch={onSearch} />);
    await user.type(screen.getByLabelText('Buscar cidade'), 'Berlin');

    rerender(<SearchBar disabled onSearch={onSearch} />);
    const button = screen.getByRole('button', { name: 'Buscar' });

    expect(screen.getByRole('searchbox', { name: 'Buscar cidade' })).toBeDisabled();
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onSearch).not.toHaveBeenCalled();
  });
});
