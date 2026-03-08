import React from "react";
import { EditableText } from "./editable-text";

type CategoryCard = {
    key: string;
    titleKey: string;
    imageUrl: string;
};

type Props = {
    titleKey: string;
    subtitle?: string;
    categories: CategoryCard[];
    onSelect: (key: string) => void;
    dir?: "rtl" | "ltr";
};

export default function CategoryCards({
    titleKey,
    subtitle,
    categories,
    onSelect,
    dir = "ltr",
}: Props) {
    return (
        <section className="w-full py-14">
            <div className="max-w-6xl mx-auto px-4">
                <div className={dir === "rtl" ? "text-right" : "text-left"}>
                    <h2 className="text-3xl font-semibold tracking-wide">
                        <EditableText k={titleKey} as="span" />
                    </h2>
                    {subtitle ? (
                        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                            {subtitle}
                        </p>
                    ) : null}
                </div>

                <div className="mt-10 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
                    {categories.map((c) => (
                        <button
                            key={c.key}
                            type="button"
                            onClick={() => onSelect(c.key)}
                            className="group text-left"
                        >
                            <div className="w-full hover:-translate-y-0.5 transition duration-300">
                                <div className="relative rounded-xl overflow-hidden aspect-[3/4]">
                                    <img
                                        className="h-full w-full object-cover"
                                        src={c.imageUrl}
                                        alt={c.key}
                                        loading="lazy"
                                        decoding="async"
                                    />
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition duration-300" />
                                </div>

                                <h3 className="mt-3 text-sm font-semibold tracking-widest uppercase text-foreground">
                                    <EditableText k={c.titleKey} as="span" />
                                </h3>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}

