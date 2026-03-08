"use client";

import { useState } from "react";
import { NumericInput } from "@/components/ui/numeric-input";

const NumericInputDemo = () => {
    const [shippingThreshold, setShippingThreshold] = useState(500);
    const [flatRate, setFlatRate] = useState(50);
    const [quantity, setQuantity] = useState(5);
    const [discount, setDiscount] = useState(15);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-8">
            <div className="max-w-2xl w-full space-y-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Numeric Input Component</h1>
                    <p className="text-muted-foreground">Interactive numeric inputs with visual progress bars</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <NumericInput
                            label="Free Shipping Threshold (EGP)"
                            min={0}
                            max={2000}
                            step={50}
                            value={shippingThreshold}
                            onChange={setShippingThreshold}
                        />
                        <p className="text-sm text-muted-foreground mt-2">Current: {shippingThreshold} EGP</p>
                    </div>

                    <div>
                        <NumericInput
                            label="Flat Rate Fee (EGP)"
                            min={0}
                            max={200}
                            step={10}
                            value={flatRate}
                            onChange={setFlatRate}
                        />
                        <p className="text-sm text-muted-foreground mt-2">Current: {flatRate} EGP</p>
                    </div>

                    <div>
                        <NumericInput
                            label="Product Quantity"
                            min={1}
                            max={100}
                            step={1}
                            value={quantity}
                            onChange={setQuantity}
                        />
                        <p className="text-sm text-muted-foreground mt-2">Current: {quantity} items</p>
                    </div>

                    <div>
                        <NumericInput
                            label="Discount Percentage"
                            min={0}
                            max={100}
                            step={5}
                            value={discount}
                            onChange={setDiscount}
                        />
                        <p className="text-sm text-muted-foreground mt-2">Current: {discount}% off</p>
                    </div>
                </div>

                <div className="mt-8 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                    <h3 className="font-semibold mb-2">Summary</h3>
                    <ul className="space-y-1 text-sm">
                        <li>Free shipping above: <strong>{shippingThreshold} EGP</strong></li>
                        <li>Standard shipping: <strong>{flatRate} EGP</strong></li>
                        <li>Cart quantity: <strong>{quantity} items</strong></li>
                        <li>Active discount: <strong>{discount}%</strong></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default NumericInputDemo;
