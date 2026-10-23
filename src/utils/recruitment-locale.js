// Only unpublished profiles derive language from the current interface locale.
// Persisted listings keep their server-stored language until explicitly replaced.
export function publicationProfile(profile,uiLocale){
 const {language,listing_language,...fields}=profile
 const code=uiLocale==='en'?'en':'zh'
 return {...fields,platform:'PC',strength_range_mode:'auto',strength_tolerance_percent:30,strength_min:null,strength_max:null,listing_language:code,language:'language.'+code}
}
