# be-parsing

Parse html and attach the parsed data to the DOM element

With customizable dropdowns, it is worth taking a look at how to "customize" managing the data that drives the dropdown options.

I've always found it kind of annoying that the option tag only supports value and text.  

I find myself often having to do lookups from the value (always a string) to the item that corresponded to that option, 
because it contains much additional useful information.

Since customizable dropdowns can display a richer user interface, it is quite likely we will see more of the data fields that are relevant to the dropdown. This provides ample opportunity to embed the data used to generate the list of options in a way that can be easily reverse engineered from the HTML markup.

We solve this by tapping into microdata, and extending that long neglected standard, with some much needed updates.  [Yours truly has proposed these very extensions](https://github.com/WICG/webcomponents/issues/1013), so until the platform suggests / implements a better alternative, 

So what this could look like is.  

Let me point out the use of the "be-parsing" attribute adorning the template element at the end.  This less than obvious markup ensures:

1.  The parsing process starts *after* the relevant HTML has all finished streaming, and
2.  Provides a way to signal that a new HTML fragment has been downloaded in the case that the options may be dynamic (for example depending on other selects) without having to standardize on an event name.

```html
<script type=itempropmap id=animal-map>
    {
        "data-scientific-classification": {
            "mapsTo": "taxonomy", 
            "instanceOf": "Object"
        },
        "data-binomial-name": "species",
        "data-population": {
            "mapsTo": "totalCount",
            "instanceOf": "Number"
        },
        "value": "key"
    }
</script>
<select itemscope=animals id="pet-select"  
    >
    <button>
        <selectedcontent></selectedcontent>
    </button>

    <option  value="">Please select a pet</option>
    <option 
      itemprop=animal
      itempropmap=animal-map
      itemscope 
      value="cat" 
      data-scientific-classification='{
        "Kingdom": "Animalia", 
        "Phylum": "Chordata",
        "Class": "Mammalia",
        "Order": "Carnivora",
        "Family": "Felidae",
        "Genus":  "Felis",
        "Species":	"F. catus"
      }'
      data-binomial-name='Felis catus'
      data-population=600_000_000
    >
        <span class="icon" 
          aria-hidden="true"
        itemprop="emoji">🐱</span>
        <span itemprop="displayName" class="option-label">Cat</span>
    </option>
    <option 
        itemprop=animal
        itempropmap=animal-map
        itemscope
        value="dog"
        data-scientific-classification='{
            "Kingdom":	"Animalia",
            "Phylum":	"Chordata",
            "Class":	"Mammalia",
            "Order":	"Carnivora",
            "Family":	"Canidae",
            "Genus":	"Canis",    
            "Species":	"C. familiaris"
        }'
        data-binomial-name='Canis familiaris'
        >
        <span class="icon" 
            itemprop=emoji  
            aria-hidden="true">🐶</span>
        <span class="option-label" itemprop=displayName>Dog</span>
    </option>
    <option
        itemprop=animal
        itempropmap=animal-map
        itemscope 
        value="hamster"
        data-scientific-classification='{
            "Kingdom":	    "Animalia",
            "Phylum":	    "Chordata",
            "Class":	    "Mammalia",
            "Order":	    "Rodentia",
            "Family":	    "Cricetidae",
            "Subfamily":	"Cricetinae"
        }'
    >
        <span class="icon"  
            itemprop=emoji 
            aria-hidden="true">🐹</span>
        <span class="option-label" itemprop=displayName>Hamster</span>
        
    </option>
    <template be-parsing></template>
</select>
```

> [!NOTE]
>  Editing JSON as shown above is error-prone.  To enable JSON syntax highlighting, consider installing this [vs-code plugin](https://marketplace.visualstudio.com/items?itemName=andersonbruceb.json-in-html) is using vscode.  Plans for a Ziad plugin are being contemplated [TODO]

What this does:

1. Goes through all the child elements to parse, looking for microdata attributes.  
2. Adds a deep mutation observer, but ignores elements inside an itemscope sub-child
3.  Assigns value to "ish" property of adorned element.

So the cat "option" would be assigned the following value:

```JavaScript
oOption.ish = {
    animal: "Cat",
    key: 'cat',
    emoji: "🐱",
    displayName: "Cat",
    taxonomy: {
        Kingdom: "Animalia", 
        Phylum: "Chordata",
        Class: "Mammalia",
        Order: "Carnivora",
        Family: "Felidae",
        Genus:  "Felis",
        Species: "F. catus"
    },
    species: "Felis catus",
    totalCount: 600_000_000
}
```

<!-- And maybe there are some commonalities we can find with how we handle JSON api calls to get the values of the dropdown 
(generated by a library based on template literals, for example), and HTML.-->
