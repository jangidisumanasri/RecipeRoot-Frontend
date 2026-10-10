
import { useEffect, useMemo, useState } from 'react'
import {
  BookOpen, ChefHat, Clock3, Flame, Heart, Leaf, Plus,
  Search, SlidersHorizontal, Sparkles, Users, X, ChevronRight,
  CircleAlert, LoaderCircle, Check, Utensils
} from 'lucide-react'
import { recipeApi } from './api'
import './App.css'

const starterRecipes = [
  {
    id: 'demo-1',
    title: 'Creamy Tuscan Pasta',
    category: 'Dinner',
    time: 25,
    difficulty: 'Easy',
    servings: 2,
    calories: 420,
    image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1000&q=85',
    description: 'Silky pasta with spinach, tomatoes and a rich garlic cream sauce.',
    ingredients: ['Pasta', 'Cherry tomatoes', 'Spinach', 'Garlic', 'Cream', 'Parmesan'],
    instructions: 'Cook pasta until al dente. Saute garlic and tomatoes, stir in spinach and cream, then toss with pasta and parmesan.'
  },
  {
    id: 'demo-2',
    title: 'Rainbow Nourish Bowl',
    category: 'Lunch',
    time: 20,
    difficulty: 'Easy',
    servings: 1,
    calories: 350,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=85',
    description: 'A colourful bowl of vegetables, grains and zesty lemon dressing.',
    ingredients: ['Quinoa', 'Avocado', 'Cucumber', 'Carrot', 'Chickpeas', 'Lemon'],
    instructions: 'Cook quinoa. Chop vegetables, rinse chickpeas and assemble in a bowl. Finish with lemon dressing.'
  },
  {
    id: 'demo-3',
    title: 'Berry Breakfast Pancakes',
    category: 'Breakfast',
    time: 15,
    difficulty: 'Easy',
    servings: 2,
    calories: 290,
    image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=1000&q=85',
    description: 'Fluffy golden pancakes topped with fresh berries and maple syrup.',
    ingredients: ['Flour', 'Milk', 'Egg', 'Baking powder', 'Mixed berries', 'Maple syrup'],
    instructions: 'Whisk flour, milk, egg and baking powder. Cook small portions on a warm pan until golden on both sides. Serve with berries.'
  },
  {
    id: 'demo-4',
    title: 'Garden Avocado Toast',
    category: 'Breakfast',
    time: 10,
    difficulty: 'Easy',
    servings: 1,
    calories: 260,
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1000&q=85',
    description: 'Crunchy sourdough topped with creamy avocado and herbs.',
    ingredients: ['Sourdough bread', 'Avocado', 'Lemon', 'Chilli flakes', 'Fresh herbs'],
    instructions: 'Toast bread. Mash avocado with lemon and seasoning, spread over toast and add herbs.'
  },
  {
    id: 'demo-5',
    title: 'Roasted Veggie Tacos',
    category: 'Dinner',
    time: 30,
    difficulty: 'Medium',
    servings: 3,
    calories: 390,
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=1000&q=85',
    description: 'Smoky roasted vegetables in warm tortillas with fresh salsa.',
    ingredients: ['Tortillas', 'Bell peppers', 'Red onion', 'Black beans', 'Salsa', 'Lime'],
    instructions: 'Roast sliced vegetables with spices. Warm tortillas, fill with vegetables and beans, and top with salsa and lime.'
  },
  {
    id: 'demo-6',
    title: 'Fresh Green Smoothie',
    category: 'Drinks',
    time: 5,
    difficulty: 'Easy',
    servings: 1,
    calories: 180,
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=1000&q=85',
    description: 'A refreshing blend of greens, banana and citrus.',
    ingredients: ['Spinach', 'Banana', 'Apple', 'Yogurt', 'Lime'],
    instructions: 'Add all ingredients to a blender and blend until smooth. Add water to adjust consistency.'
  }
]

const categories = [
  'All recipes', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Drinks'
]

const SAVED_KEY = 'reciperoot-saved'

function readSavedRecipes() {
  try {
    const stored = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]')

    // Support previously saved recipe IDs and recipe objects.
    if (!Array.isArray(stored)) return []

    return stored
      .map(item => {
        if (item && typeof item === 'object') return item

        return starterRecipes.find(
          recipe => String(recipe.id) === String(item)
        )
      })
      .filter(Boolean)
  } catch {
    return []
  }
}

function normalise(recipe, index = 0) {
  const fallbackImage = starterRecipes[index % starterRecipes.length].image

  return {
    id: recipe.id ?? recipe.recipeId ?? `api-${index}`,
    title: recipe.title ?? recipe.name ?? 'Untitled recipe',
    category: recipe.category ?? recipe.mealType ?? 'Recipe',
    time: Number(
      recipe.time ?? recipe.preparationTime ?? recipe.cookingTime ?? 25
    ),
    difficulty: recipe.difficulty ?? 'Easy',
    servings: Number(recipe.servings ?? 2),
    calories: Number(recipe.calories ?? 0),
    image: recipe.imageUrl ?? recipe.image ?? recipe.photoUrl ?? fallbackImage,
    description: recipe.description ?? 'A delicious recipe for your kitchen collection.',
    ingredients: Array.isArray(recipe.ingredients)
      ? recipe.ingredients.map(item =>
          typeof item === 'string' ? item : item?.name ?? String(item)
        )
      : [],
    instructions: recipe.instructions ?? recipe.method ?? 'No instructions available yet.'
  }
}

function RecipeCard({ recipe, saved, onSave, onOpen }) {
  return (
    <article className="recipe-card">
      <button
        className="image-button"
        onClick={() => onOpen(recipe)}
        aria-label={`Open ${recipe.title}`}
      >
        <img
          src={recipe.image}
          alt={recipe.title}
          loading="lazy"
          onError={event => {
            event.currentTarget.onerror = null
            event.currentTarget.src = starterRecipes[0].image
          }}
        />
        <span className="category-tag">{recipe.category}</span>
      </button>

      <button
        type="button"
        className={`save-button ${saved ? 'saved' : ''}`}
        onClick={() => onSave(recipe)}
        aria-label={saved ? 'Remove saved recipe' : 'Save recipe'}
        title={saved ? 'Remove from My Collection' : 'Save to My Collection'}
      >
        <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
      </button>

      <div className="recipe-card-body">
        <div className="recipe-meta">
          <span><Clock3 size={14} /> {recipe.time} min</span>
          <span>
            <Flame size={14} />
            {recipe.calories ? `${recipe.calories} cal` : recipe.difficulty}
          </span>
        </div>

        <button className="recipe-title" onClick={() => onOpen(recipe)}>
          {recipe.title}
        </button>

        <p>{recipe.description}</p>

        <button className="view-recipe" onClick={() => onOpen(recipe)}>
          View recipe <ChevronRight size={16} />
        </button>
      </div>
    </article>
  )
}

function RecipeModal({ recipe, onClose, saved, onSave }) {
  if (!recipe) return null

  return (
    <div
      className="modal-backdrop"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="recipe-modal"
        role="dialog"
        aria-modal="true"
        aria-label={recipe.title}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <img className="modal-image" src={recipe.image} alt={recipe.title} />

        <div className="modal-content">
          <span className="eyebrow">
            {recipe.category} · {recipe.difficulty}
          </span>

          <h2>{recipe.title}</h2>
          <p>{recipe.description}</p>

          <div className="modal-stats">
            <span><Clock3 size={16} /> {recipe.time} minutes</span>
            <span><Users size={16} /> {recipe.servings} servings</span>
            {recipe.calories > 0 && (
              <span><Flame size={16} /> {recipe.calories} cal</span>
            )}
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={() => onSave(recipe)}
          >
            <Heart size={17} fill={saved ? 'currentColor' : 'none'} />
            {saved ? 'Remove from My Collection' : 'Save recipe'}
          </button>

          <h3>Ingredients</h3>

          {recipe.ingredients.length ? (
            <ul className="ingredient-list">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={`${ingredient}-${index}`}>
                  <Check size={15} /> {ingredient}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Ingredients have not been added yet.</p>
          )}

          <h3>How to make it</h3>
          <p className="instructions">{recipe.instructions}</p>
        </div>
      </section>
    </div>
  )
}

function AddRecipeModal({ onClose, onCreate, busy }) {
  const [form, setForm] = useState({
    title: '',
    category: 'Dinner',
    time: '25',
    servings: '2',
    image: '',
    description: '',
    ingredients: '',
    instructions: ''
  })

  function change(event) {
    const { name, value } = event.target
    setForm(previous => ({ ...previous, [name]: value }))
  }

  function submit(event) {
    event.preventDefault()

    onCreate({
      ...form,
      time: Number(form.time),
      servings: Number(form.servings),
      ingredients: form.ingredients
        .split(',')
        .map(item => item.trim())
        .filter(Boolean),
      image: form.image || starterRecipes[0].image,
      imageUrl: form.image || starterRecipes[0].image
    })
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <form className="add-modal" onSubmit={submit}>
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <span className="eyebrow">YOUR KITCHEN</span>
        <h2>Add a recipe</h2>
        <p className="muted">Save a favourite or share something new.</p>

        <label>
          Recipe name
          <input
            name="title"
            value={form.title}
            onChange={change}
            required
            placeholder="e.g. Lemon herb rice"
          />
        </label>

        <div className="form-row">
          <label>
            Category
            <select name="category" value={form.category} onChange={change}>
              {categories
                .filter(category => category !== 'All recipes')
                .map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
            </select>
          </label>

          <label>
            Time (minutes)
            <input
              name="time"
              type="number"
              min="1"
              value={form.time}
              onChange={change}
              required
            />
          </label>
        </div>

        <label>
          Servings
          <input
            name="servings"
            type="number"
            min="1"
            value={form.servings}
            onChange={change}
            required
          />
        </label>

        <label>
          Image URL <span className="muted">(optional)</span>
          <input
            name="image"
            type="url"
            value={form.image}
            onChange={change}
            placeholder="https://example.com/food.jpg"
          />
        </label>

        <label>
          Short description
          <textarea
            name="description"
            value={form.description}
            onChange={change}
            required
            rows="2"
            placeholder="What makes it special?"
          />
        </label>

        <label>
          Ingredients <span className="muted">(comma-separated)</span>
          <input
            name="ingredients"
            value={form.ingredients}
            onChange={change}
            placeholder="Rice, lemon, herbs"
          />
        </label>

        <label>
          Instructions
          <textarea
            name="instructions"
            value={form.instructions}
            onChange={change}
            required
            rows="3"
            placeholder="Describe the preparation steps"
          />
        </label>

        <button className="primary-button full" disabled={busy}>
          {busy ? 'Saving...' : <><Plus size={17} /> Save recipe</>}
        </button>
      </form>
    </div>
  )
}

export default function App() {
  const [recipes, setRecipes] = useState(starterRecipes)
  const [activeCategory, setActiveCategory] = useState('All recipes')
  const [query, setQuery] = useState('')
  const [savedRecipes, setSavedRecipes] = useState(readSavedRecipes)
  const [showSaved, setShowSaved] = useState(false)
  const [selected, setSelected] = useState(null)
  const [adding, setAdding] = useState(false)
  const [busy, setBusy] = useState(false)
  const [apiState, setApiState] = useState('loading')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let mounted = true

    recipeApi.getAll()
      .then(data => {
        if (!mounted) return

        const list = Array.isArray(data)
          ? data
          : data?.content ?? data?.recipes ?? data?.data ?? []

        if (Array.isArray(list) && list.length > 0) {
          setRecipes(list.map(normalise))
        }

        setApiState('connected')
      })
      .catch(() => {
        if (mounted) setApiState('offline')
      })

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(savedRecipes))
    } catch {
      setNotice('Unable to save your collection in this browser.')
    }
  }, [savedRecipes])

  const savedIds = useMemo(
    () => new Set(savedRecipes.map(recipe => String(recipe.id))),
    [savedRecipes]
  )

  const displayedRecipes = showSaved ? savedRecipes : recipes

  const filtered = useMemo(() => {
    return displayedRecipes.filter(recipe => {
      const matchesCategory =
        activeCategory === 'All recipes' ||
        recipe.category?.toLowerCase() === activeCategory.toLowerCase()

      const searchableText = [
        recipe.title,
        recipe.description,
        recipe.category,
        ...(recipe.ingredients || [])
      ].join(' ').toLowerCase()

      return matchesCategory && searchableText.includes(query.toLowerCase())
    })
  }, [displayedRecipes, activeCategory, query])

  function toggleSave(recipe) {
    setSavedRecipes(previous => {
      const alreadySaved = previous.some(
        item => String(item.id) === String(recipe.id)
      )

      if (alreadySaved) {
        setNotice(`Removed "${recipe.title}" from your collection.`)
        return previous.filter(item => String(item.id) !== String(recipe.id))
      }

      setNotice(`Saved "${recipe.title}" to your collection.`)
      return [recipe, ...previous]
    })
  }

  async function createRecipe(payload) {
    setBusy(true)

    try {
      const apiPayload = {
        title: payload.title,
        category: payload.category,
        cookingTime: payload.time,
        servings: payload.servings,
        imageUrl: payload.imageUrl,
        description: payload.description,
        ingredients: payload.ingredients,
        instructions: payload.instructions
      }

      const created = await recipeApi.create(apiPayload)

      const newRecipe = normalise(
        created && typeof created === 'object'
          ? created
          : { ...payload, id: `local-${Date.now()}` },
        recipes.length
      )

      setRecipes(previous => [newRecipe, ...previous])
      setNotice('Recipe saved to the backend.')
      setAdding(false)
    } catch {
      const localRecipe = normalise(
        { ...payload, id: `local-${Date.now()}` },
        recipes.length
      )

      setRecipes(previous => [localRecipe, ...previous])
      setNotice('Recipe added for this session only. Backend save failed.')
      setAdding(false)
    } finally {
      setBusy(false)
      window.setTimeout(() => setNotice(''), 5000)
    }
  }

  function goToDiscover() {
    setShowSaved(false)
    setActiveCategory('All recipes')
    setQuery('')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a
          className="brand"
          href="#"
          onClick={event => {
            event.preventDefault()
            goToDiscover()
          }}
        >
          <span className="brand-mark"><Leaf size={22} /></span>
          <span>
            recipe<span className="brand-accent">root</span>
            <small>GOOD FOOD, GROWN DAILY</small>
          </span>
        </a>

        <nav className="desktop-nav">
          <button
            className={!showSaved ? 'nav-active' : ''}
            onClick={goToDiscover}
          >
            Discover
          </button>
          <button
            className={showSaved ? 'nav-active' : ''}
            onClick={() => {
              setShowSaved(true)
              setActiveCategory('All recipes')
            }}
          >
            My collection <span className="nav-count">{savedRecipes.length}</span>
          </button>
        </nav>

        <div className="top-actions">
          <span className={`api-indicator ${apiState}`}>
            <span />
            {apiState === 'connected'
              ? 'Connected'
              : apiState === 'loading'
                ? 'Connecting'
                : 'Demo mode'}
          </span>

          <button className="primary-button add-top" onClick={() => setAdding(true)}>
            <Plus size={17} /> Add recipe
          </button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">
              <Sparkles size={14} /> A LITTLE INSPIRATION FOR YOUR TABLE
            </span>

            <h1>Find your next<br /><em>favourite.</em></h1>

            <p>
              Fresh ideas, simple ingredients, and recipes worth sharing.
              Let’s make something wonderful.
            </p>

            <div className="hero-search">
              <Search size={19} />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search recipes, ingredients..."
                aria-label="Search recipes"
              />
              {query && (
                <button onClick={() => setQuery('')} aria-label="Clear search">
                  <X size={17} />
                </button>
              )}
            </div>

            <div className="hero-proof">
              <span><span className="proof-dot" /> Simple, everyday ingredients</span>
              <span><span className="proof-dot" /> Made for real life</span>
            </div>
          </div>

          <div className="hero-visual">
            <img
              src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=90"
              alt="Fresh colourful food ingredients"
            />
            <div className="floating-note">
              <span className="note-icon"><ChefHat size={20} /></span>
              <span>
                <strong>Cook something good</strong>
                <small>Your kitchen, your rules.</small>
              </span>
            </div>
            <div className="hero-sticker">
              <Leaf size={20} />
              <span>FRESH<br />IDEAS</span>
            </div>
          </div>
        </section>

        <section className="content-section" id="recipes">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                {showSaved ? 'YOUR PERSONAL COOKBOOK' : 'THE GOOD STUFF'}
              </span>
              <h2>{showSaved ? 'Your collection' : 'Recipes to fall for'}</h2>
              <p>
                {showSaved
                  ? 'All the recipes you have saved in one place.'
                  : 'A few delicious ideas to get you started.'}
              </p>
            </div>

            <div className="result-count">
              <BookOpen size={17} /> {filtered.length} recipes
            </div>
          </div>

          <div className="filters">
            <div className="category-tabs">
              {categories.map(category => (
                <button
                  key={category}
                  className={activeCategory === category ? 'category-active' : ''}
                  onClick={() => {
                    setActiveCategory(category)
                    if (category !== 'All recipes' || showSaved) {
                      setShowSaved(false)
                    }
                  }}
                >
                  {category}
                </button>
              ))}
            </div>

            <button
              className={`filter-button ${showSaved ? 'filter-on' : ''}`}
              onClick={() => {
                setShowSaved(previous => !previous)
                setActiveCategory('All recipes')
              }}
            >
              <SlidersHorizontal size={16} />
              <span>{showSaved ? 'Showing saved' : 'Saved recipes'}</span>
            </button>
          </div>

          {apiState === 'loading' && (
            <div className="connection-note">
              <LoaderCircle size={15} className="spin" />
              Connecting to your RecipeRoot backend...
            </div>
          )}

          {apiState === 'offline' && (
            <div className="connection-note">
              <CircleAlert size={15} />
              Backend not responding. Displaying sample recipes.
              Check your backend URL and API endpoint.
            </div>
          )}

          {notice && (
            <div className="toast">
              <Check size={17} /> {notice}
              <button onClick={() => setNotice('')} aria-label="Dismiss">
                <X size={15} />
              </button>
            </div>
          )}

          {filtered.length > 0 ? (
            <div className="recipe-grid">
              {filtered.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  saved={savedIds.has(String(recipe.id))}
                  onSave={toggleSave}
                  onOpen={setSelected}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span><Utensils size={25} /></span>
              <h3>{showSaved ? 'Your collection is waiting' : 'No recipes found'}</h3>
              <p>
                {showSaved
                  ? 'Tap the heart on any recipe to keep it here.'
                  : 'Try another search or choose a different category.'}
              </p>
              <button
                className="secondary-button"
                onClick={() => {
                  setQuery('')
                  setActiveCategory('All recipes')
                  setShowSaved(false)
                }}
              >
                Explore all recipes
              </button>
            </div>
          )}
        </section>

        <section className="newsletter">
          <div className="newsletter-icon"><Leaf size={24} /></div>
          <div>
            <span className="eyebrow">A NOTE FROM OUR KITCHEN</span>
            <h2>Good food brings us together.</h2>
            <p>Save the recipes you love. Make them your own. Pass them around.</p>
          </div>
          <button className="secondary-button" onClick={() => setAdding(true)}>
            Share a recipe <ChevronRight size={16} />
          </button>
        </section>
      </main>

      <footer>
        <a
          className="footer-brand"
          href="#"
          onClick={event => {
            event.preventDefault()
            goToDiscover()
          }}
        >
          <Leaf size={17} /> RecipeRoot
        </a>
        <span>Rooted in good food. Made with care.</span>
        <span>© {new Date().getFullYear()} RecipeRoot</span>
      </footer>

      {selected && (
        <RecipeModal
          recipe={selected}
          onClose={() => setSelected(null)}
          saved={savedIds.has(String(selected.id))}
          onSave={toggleSave}
        />
      )}

      {adding && (
        <AddRecipeModal
          onClose={() => setAdding(false)}
          onCreate={createRecipe}
          busy={busy}
        />
      )}
    </div>
  )
}