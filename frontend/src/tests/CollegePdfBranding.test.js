import { describe, it, expect, vi } from 'vitest';
import {
  COLLEGE_BRANDING,
  applyCollegePageLayout,
} from '../utils/collegePdfBranding';

describe('College PDF Branding Specification', () => {
  it('defines exact dimensions matching BORDER.docx and RIT logo reference', () => {
    expect(COLLEGE_BRANDING.borderInsetPt).toBe(24);
    expect(COLLEGE_BRANDING.borderWidthPt).toBe(1.0);
    expect(COLLEGE_BRANDING.headerHeightPt).toBe(75);
    const calculatedAspect = COLLEGE_BRANDING.logoWidthPt / COLLEGE_BRANDING.logoHeightPt;
    expect(calculatedAspect).toBeCloseTo(4.47, 1);
  });

  const createMockPdf = (width = 595.28, height = 841.89) => {
    return {
      internal: {
        pageSize: {
          getWidth: () => width,
          getHeight: () => height,
        },
        getNumberOfPages: () => 1,
      },
      saveGraphicsState: vi.fn(),
      restoreGraphicsState: vi.fn(),
      rect: vi.fn(),
      setDrawColor: vi.fn(),
      setLineWidth: vi.fn(),
      setFillColor: vi.fn(),
      setTextColor: vi.fn(),
      setFont: vi.fn(),
      setFontSize: vi.fn(),
      text: vi.fn(),
      addImage: vi.fn(),
      line: vi.fn(),
      setGState: vi.fn(),
      GState: vi.fn().mockImplementation((props) => props),
    };
  };

  it('draws 24pt inset border around page', () => {
    const doc = createMockPdf(600, 800);
    applyCollegePageLayout(doc, {
      title: 'Academic Report',
      includeHeader: false,
      includeWatermark: false,
    });

    expect(doc.rect).toHaveBeenCalledWith(24, 24, 552, 752);
    expect(doc.setLineWidth).toHaveBeenCalledWith(1.0);
  });

  it('applies top-left logo and watermark with opacity 0.05', () => {
    const doc = createMockPdf();
    applyCollegePageLayout(doc, {
      title: 'Class Timetable',
      documentSubtitle: 'Department of Computer Science',
      pageNumber: 1,
      totalPages: 3,
      includeHeader: true,
      includeWatermark: true,
    });

    expect(doc.addImage).toHaveBeenCalled();
    expect(doc.GState).toHaveBeenCalledWith(expect.objectContaining({ opacity: 0.05 }));
    expect(doc.text).toHaveBeenCalledWith(
      expect.stringContaining('Page 1 of 3'),
      expect.any(Number),
      expect.any(Number),
      { align: 'right' }
    );
  });

  it('includes college institutional identity and addresses in header', () => {
    const doc = createMockPdf();
    applyCollegePageLayout(doc, {
      title: 'Department Overview',
      includeHeader: true,
    });

    expect(doc.text).toHaveBeenCalledWith(
      COLLEGE_BRANDING.institutionName,
      expect.any(Number),
      35,
      { align: 'right' }
    );
  });
});
