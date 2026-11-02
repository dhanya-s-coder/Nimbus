import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DesignPanel from './DesignPanel';
import { makeText, makeField, makeShape, makeImage, makeBlock } from './elements';

const makeDesign = () => ({
    isBlank: true, hasPhoto: false,
    add: jest.fn(), update: jest.fn(), style: jest.fn(), duplicate: jest.fn(), reorder: jest.fn(), align: jest.fn(),
    remove: jest.fn(), setBg: jest.fn(), removePhoto: jest.fn(), generateBg: jest.fn(), addImage: jest.fn(), setElementOverride: jest.fn(),
    addBlockImage: jest.fn(), replaceBlockImage: jest.fn(),
});

const mount = (design, elements = [], selectedId = null) => render(
    <DesignPanel design={design} custom={{ elements }} overrides={{}} selectedId={selectedId} onSelect={jest.fn()} onUploadPhoto={jest.fn()} swatches={['#112233']} />
);

test('adding things from the Add menu', () => {
    const design = makeDesign();
    mount(design);
    fireEvent.click(screen.getByText('Text'));
    expect(design.add).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'text' }));
    fireEvent.click(screen.getByText('Shape'));
    fireEvent.click(screen.getByText('Circle'));
    expect(design.add).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'shape', kind: 'ellipse' }));
    // QR code / Speaker photo work like Image: pick a file, it lands on the poster
    const file = new File(['x'], 'qr.png', { type: 'image/png' });
    const inputs = document.querySelectorAll('input[type=file]');
    fireEvent.change(inputs[1], { target: { files: [file] } });
    expect(design.addBlockImage).toHaveBeenLastCalledWith('qr1', file);
    fireEvent.change(inputs[2], { target: { files: [file] } });
    expect(design.addBlockImage).toHaveBeenLastCalledWith('avatar', file);
    fireEvent.change(screen.getByDisplayValue('Insert from the form…'), { target: { value: 'venue' } });
    expect(design.add).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'field', bind: 'venue' }));
});

test('background: describe-to-generate is enabled only with a description', () => {
    const design = makeDesign();
    mount(design);
    const gen = screen.getByText(/Generate background/);
    expect(gen).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText(/watercolour clouds/), { target: { value: 'misty mountains' } });
    expect(gen).not.toBeDisabled();
    fireEvent.click(gen);
    expect(design.generateBg).toHaveBeenCalledWith('misty mountains');
    fireEvent.click(screen.getByLabelText(/Gradient #0f172a to #1e3a8a/));
    expect(design.setBg).toHaveBeenCalledWith({ c1: '#0f172a', c2: '#1e3a8a' });
});

test('layers list: reorder, hide, lock, duplicate, delete', () => {
    const design = makeDesign();
    const el = makeText({ text: 'Hello' });
    mount(design, [el]);
    fireEvent.click(screen.getByLabelText('Bring forward'));
    expect(design.reorder).toHaveBeenCalledWith(el.id, 'up');
    fireEvent.click(screen.getByLabelText('Hide'));
    expect(design.setElementOverride).toHaveBeenCalledWith(el.id, { hidden: true });
    fireEvent.click(screen.getByLabelText('Lock'));
    expect(design.setElementOverride).toHaveBeenCalledWith(el.id, { locked: true });
    fireEvent.click(screen.getByLabelText('Duplicate'));
    expect(design.duplicate).toHaveBeenCalledWith(el.id);
    fireEvent.click(screen.getByLabelText('Delete'));
    expect(design.remove).toHaveBeenCalledWith(el.id);
});

test.each([
    ['text', makeText({ text: 'Hi' })],
    ['field', makeField('title')],
    ['shape', makeShape('rect')],
    ['line', makeShape('line')],
    ['image', makeImage('data:image/png;base64,AAAA', 200, 100)],
    ['avatar', makeBlock('avatar')],
    ['qr', makeBlock('qr1')],
])('the properties panel renders for a selected %s', (_name, el) => {
    mount(makeDesign(), [el], el.id);
    expect(screen.getByText('Align to poster')).toBeInTheDocument();
});

test('editing a text element sends its changes through update / style', () => {
    const design = makeDesign();
    const el = makeText({ text: 'Hi' });
    mount(design, [el], el.id);
    fireEvent.change(screen.getByLabelText('Text'), { target: { value: 'Bye' } });
    expect(design.update).toHaveBeenCalledWith(el.id, { text: 'Bye' });
    fireEvent.click(screen.getByText('AA')); // upper-case
    expect(design.style).toHaveBeenCalledWith(el.id, { case: 'upper' });
});
