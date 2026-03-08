import React from 'react';
import { X, Ruler } from 'lucide-react';
import { Product } from '../types';

interface SizeGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
    product?: Product;
}

const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose, product }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-background w-full max-w-4xl rounded-xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 border border-border">
                {/* Header */}
                <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                    <div className="flex items-center gap-2">
                        <Ruler className="text-secondary" />
                        <h2 className="text-xl font-black uppercase tracking-tighter text-primary">دليل القياسات</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="text-muted-foreground" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[80vh]">
                    {product?.sizeGuideImage ? (
                        <div className="flex justify-center">
                            <img
                                src={product.sizeGuideImage}
                                alt="دليل القياسات"
                                className="max-w-full h-auto rounded-lg"
                            />
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>لا يوجد دليل قياسات متاح لهذا المنتج</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SizeGuideModal;
