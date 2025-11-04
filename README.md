# RichTextForge

Un éditeur de texte riche (WYSIWYG) moderne et léger en JavaScript vanilla.

![RichTextForge Demo](image.png)

## Installation

Incluez simplement le fichier JavaScript dans votre projet :

```html
<script src="richtextforge.js"></script>
```

## Utilisation de base

```html
<textarea id="editeur"></textarea>

<script>
  const editeur = new RichTextForge('#editeur');
</script>
```

## Options

```javascript
const editeur = new RichTextForge('#editeur', {
  placeholder: "Commencez à écrire...",
  height: "400px",
  theme: "light"
});
```

| Option | Type | Défaut | Description |
|--------|------|--------|-------------|
| `placeholder` | string | "Commencez à écrire..." | Texte affiché quand l'éditeur est vide |
| `height` | string | "300px" | Hauteur de la zone d'édition |
| `theme` | string | "light" | Thème de l'éditeur |

## Fonctionnalités

### Formatage de texte
- **Gras** (Ctrl+B)
- *Italique* (Ctrl+I)
- <u>Souligné</u> (Ctrl+U)
- ~~Barré~~

### Titres
- H1, H2, H3
- Paragraphe normal

### Listes
- Liste à puces
- Liste numérotée

### Autres
- Liens hypertexte
- Citations
- Alignement (gauche, centre, droite)
- Vue code HTML
- Effacer le formatage

## Méthodes API

```javascript
// Récupérer le contenu HTML
const html = editeur.getContent();

// Définir le contenu
editeur.setContent('<p>Nouveau contenu</p>');

// Détruire l'éditeur
editeur.destroy();
```

## Avantages

- ✅ Aucune dépendance
- ✅ Léger 
- ✅ Compatible tous navigateurs modernes
- ✅ Synchronisation automatique avec textarea


## Licence

MIT
