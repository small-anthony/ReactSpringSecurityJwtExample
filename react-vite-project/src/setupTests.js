import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import React from 'react';

vi.mock('react-pdf', () => ({
    Document: ({ children }) => React.createElement('div', null, children),
    Page: () => React.createElement('div', null, 'Page'),
    pdfjs: {
        GlobalWorkerOptions: {
            workerSrc: '',
        },
    },
}));
