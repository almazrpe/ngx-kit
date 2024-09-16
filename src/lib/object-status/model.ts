/**
 * Size options for the component
 * Small option: 
 * - adds 80% scale transform, and 
 * - disables appearance of untwisting short title
 */
export enum ObjectStatusSize {
    Normal = 0,
    Small = 1,
}

/**
 * Data interface for a representation of some object status
 */
export interface ObjectStatusData {
    /**
     * Full title using in [title] attribute of main <div> element
     */
    fullTitle: string;
    /**
     * Short title that shows up on :hover
     */
    shortTitle: string;
    /**
     * Address for some image representing the status
     */
    imgSrc: string;
    /**
     * Css classes using in [ngClass] attribute of <img> element
     */
    imgExtraClasses: string[];
    /**
     * Additional css class for controlling width in untwisted state
     * You need to specify this class if want to make enough space for 
     * the image and the short title
     */
    hoverWidthClass: string
}

/**
 *  Some examples of ObjectStatusData:
 *
 *  {
 *       fullTitle: "Object status is unknown",
 *       shortTitle: "UNKNOWN",
 *       imgSrc: "some_address_of_unknown_img",
 *       imgExtraClasses: ["opacity-65", "w-8", "p-1.5"],
 *       hoverWidthClass: "hover:w-[8.7rem]"
 *  }
 * 
 *  {
 *       fullTitle: "Object is ready to edit",
 *       shortTitle: "EDITABLE",
 *       imgSrc: "some_address_of_editable_img",
 *       imgExtraClasses: ["opacity-80", "w-8", "p-1"],
 *       hoverWidthClass: "hover:w-32"
 *  }
 * 
 *  {
 *       fullTitle: "The object is in use right now",
 *       shortTitle: "IN USE",
 *       imgSrc: "some_address_of_in_use_img",
 *       imgExtraClasses: ["w-6", "py-1", "pl-0.5", "pr-1.5"],
 *       hoverWidthClass: "hover:w-40"
 *  }
 */
