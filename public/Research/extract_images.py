import fitz
import os

pdf_path = r"C:\Users\Admin\Documents\Prateek Khanna\Research\Raw_District_Brochure.pdf"
out_dir = r"C:\Users\Admin\Documents\Prateek Khanna\Research\extracted_images"
os.makedirs(out_dir, exist_ok=True)

doc = fitz.open(pdf_path)
count = 0
for page_num in range(min(15, len(doc))): # check first 15 pages for sketches/renders
    page = doc[page_num]
    images = page.get_images()
    for img_idx, img in enumerate(images):
        xref = img[0]
        pix = fitz.Pixmap(doc, xref)
        
        # Only save reasonably sized images, skip logos/icons
        if pix.width > 400 and pix.height > 400:
            if pix.n - pix.alpha > 3: # CMYK
                pix = fitz.Pixmap(fitz.csRGB, pix)
            
            img_path = os.path.join(out_dir, f"page{page_num}_img{img_idx}.jpg")
            pix.save(img_path)
            count += 1
            if count >= 10:
                break
    if count >= 10:
        break
print(f"Extracted {count} images")
