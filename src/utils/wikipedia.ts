import axios from 'axios';

const pagesEP = (title: string): string => `https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${title}&cmlimit=max&format=json&cmnamespace=0`;
const subcategoriesEP = (title: string): string => `https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${title}&cmlimit=max&format=json&cmtype=subcat`;

/*
    Collects the article pages in a given category.
*/
async function getPagesInCategory(category: string): Promise<string[]> {
    const response = await axios.get(pagesEP(category));
    const pages = response.data.query.categorymembers.map((m: any) => m.title);
    // console.log("Pages of ", category, pages);
    console.log("Extracting pages from category ", category);
    return pages;
}

async function getSubcategories(category: string): Promise<string[]> {
    const response = await axios.get(subcategoriesEP(category));
    const subcategories = response.data.query.categorymembers.map((m: any) => m.title);
    // console.log("Subcategories of ", category, subcategories);
    return subcategories;
}

async function collectPagesInCategory_help(categoryTitle: string, subcategoryDepth: number): Promise<string[]> {
    const pages = await getPagesInCategory(categoryTitle); // get the regular pages in this category no matter what.

    if (subcategoryDepth > 0) {
        // find all subcategories and add their pages to the list.
        const subcategories = await getSubcategories(categoryTitle);
        for (const subcategory of subcategories) {
            const subcategoryPages = await collectPagesInCategory_help(subcategory, subcategoryDepth - 1);
            pages.push(...subcategoryPages);
        }
    }

    return pages;
}

export async function collectPagesInCategory(categoryTitle: string): Promise<string[]> {
    const pages = await collectPagesInCategory_help(categoryTitle, 1);
    return pages;
}