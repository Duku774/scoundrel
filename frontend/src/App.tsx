import { useState } from 'react';
import './App.css'

interface Card {
  suit: string
  rank: string
}

interface Weapon {
	strength: number
	last: number
  lastSuit: string
}

type Deck = Card[];

const symbols = new Map([
  ["hearts", '♥'],
  ["diamonds", '♦'],
  ["clubs", '♣'],
  ["spades", '♠'],
])

const createDeck = (): Deck => {
  const deck: Deck = [];
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

  suits.forEach((suit) => {
    ranks.forEach((rank) => {
      if(suit === 'hearts' || suit === 'diamonds') {
        switch(rank) {
          case 'J':
          case 'Q':
          case 'K':
          case 'A':
            return;
        }
      }
      const card: Card = {suit, rank}
      deck.push(card);
    })
  })

  return deck
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }

  return result
}


function App() {
  const [deck, setDeck] = useState<Deck>(shuffle(createDeck()))
  const [hand, setHand] = useState<Deck>([])
	const [life, setLife] = useState(20)
	const [weapon, setWeapon] = useState<Weapon>()
  const [skipped, setSkipped] = useState(false)
  const [healed, setHealed] = useState(false)
  const [opponent, setOpponent] = useState<Card>()
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(-208)
  const [tutorial, setTutorial] = useState(true)
  const [active, setActive] = useState<Card>()
  const [menu, setMenu] = useState(false)
  const [deckColor, setDeckColor] = useState("green")

  const handleRestart = () => {  
    setDeck(shuffle(createDeck()))
    setHand([])
    setLife(20)
    setWeapon(undefined)
    setSkipped(false)
    setHealed(false)
    setOpponent(undefined)
    setGameOver(false)
    setScore(-208)
    drawCards(4)
    setActive(undefined)
  }

  const drawCards = (count: number) => {
    const drawn = deck.slice(0, count);
    setHand((prevHand => [...prevHand, ...drawn]))
    setDeck((prevDeck) => prevDeck.slice(count))
  }

  const putBack = () => {
    setDeck((prevDeck) => [...prevDeck, ...hand])
    setHand([])
  }

  const handleSkip = () => {
    setSkipped(true)
    putBack()
    drawCards(4)
    setHealed(false)
  }

	const handleCard = (card: Card) => {
    setActive(card)
		if(card.suit === 'clubs' || card.suit === 'spades') {
      setOpponent(card)
		} else if(card.suit === 'hearts') {
      const heal = healed ? 0 : Number(card.rank)
			setLife(Math.min(life + heal, 20))
			removeCardHand(card)
      setSkipped(true)
      setHealed(true)
      if(hand.length === 2) {
        drawCards(3)
        setSkipped(false)
        setHealed(false)
      } else if (hand.length === 1 && !deck) {
        setGameOver(true)
        setScore(score + (life + heal - 20))
      }
		} else if(card.suit === 'diamonds') {
			setWeapon({strength: Number(card.rank), last: 0, lastSuit: "spades"})
			removeCardHand(card)
      setSkipped(true)
      if(hand.length === 2) {
        drawCards(3)
        setSkipped(false)
        setHealed(false)
      }  else if (hand.length === 1 && !deck) {
        setGameOver(true)
      }
		}
	}

  const fight = (card: Card, weapon: Weapon) => {
		let damage = getPower(card)

    setScore(score + damage)

    if (weapon.last > -1) {
      setWeapon({...weapon, last: damage, lastSuit: card.suit})
      damage = Math.max(damage - weapon.strength, 0)
    }

    setLife(life - damage)
		removeCardHand(card)
    setOpponent(undefined)

    if(life - damage <= 0) {
      setGameOver(true)
    }

    setSkipped(true)

    if(hand.length === 2) {
      drawCards(3)
      setSkipped(false)
      setHealed(false)
    }  else if (hand.length === 1 && !deck) {
      setGameOver(true)
    }
  }

  const getPower = (card: Card) => {
    let damage = 0
    switch(card.rank) {
		  case 'J':
			  damage = 11
			  break
      case 'Q':
			  damage = 12
			  break
      case 'K':
			  damage = 13
			  break
      case 'A':
			  damage = 14
				break
			default:
				damage = Number(card.rank)
				break;
		}
    return damage
  }

  const getNeatEnemy = (str: number) => {
    switch(str) {
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      case 14:
        return 'A'
      default:
        return str
    }
  }

	const removeCardHand = (cardToRemove: Card) => {
		setHand(prev =>
			prev.filter(card =>
				!(card.suit === cardToRemove.suit && card.rank === cardToRemove.rank)
			)
		)
	}

  const isDisabled = (opp: Card) => {
    if(!weapon)
      return true
    else if (weapon.last <= getPower(opp) && weapon.last !== 0)
      return true

    return false
  }

  return (
    <>
      <div style={{display: "flex"}}>
        <div className='handWrapper'>
          <div style={{padding: "1rem"}}>
            <div className={`cardback ${deckColor}`}>
              {deck.length}
            </div>
          </div>
          {hand && (
            <ul style={{width: "400px", display: "flex", justifyContent: "center"}}>
              {hand.map((card: Card) => (
                <li>
                  <div 
                  onClick={() => (handleCard(card))} 
                  className={`card ${card.suit === "spades" || card.suit === "clubs" ? "black" : "red"} ${active === card && "active"}`}
                  >
                    {card.rank} {symbols.get(card.suit)}
                    </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className='hp'>
          Current life: 
        <div className='hpDice'>{life}</div>
        </div>
      </div>
      <button onClick={() => handleSkip()} disabled={skipped} style={{margin: "10px"}}>
        Skip
      </button>
      {opponent ? ( 
        <div className='decision'>
          <div className='question'>How do you want to fight?</div>
          <div className='fightButtons'>
            <button onClick={() => fight(opponent, {strength: 0, last: -1, lastSuit: "spades"})}>
              Barehanded
            </button>
            <button onClick={() => fight(opponent, weapon!)} disabled={isDisabled(opponent)}>
              Weapon
            </button>
            <button onClick={() => {setOpponent(undefined); setActive(undefined)}}>
              Cancel
            </button>
          </div>
        </div>) : (<div style={{height: "120px"}}/>)
      }
			<div className='weaponHand'>
        {weapon ? (
        <div style={{border: "3px black solid"}}>
          <div className='weaponStatus'>Current weapon: </div>
          <div className='handWeapon'>
            <div className='weaponCards'>
              <div className='card red'>
                {weapon.strength} {symbols.get("diamonds")}
              </div>
              {weapon.last > 0 && (
                <div className='card black'>
                  {getNeatEnemy(weapon.last)} {symbols.get(weapon.lastSuit)}
                </div>
              )}
            </div>
          </div>
        </div>) : <></>}
			</div>
      {gameOver && (
        <div className='overlay'>
          <div className='gameover'>
            <div className='goHeader'>
              Game Over
            </div>
            <div className='goText'>
              Your final score is: {score}
            </div>
            <button onClick={handleRestart}>
              Try again?
            </button>
          </div>
        </div>
      )}
      {tutorial && (
        <>
          <div className='overlay'>
            <div className='tutorial'>
              <div className='tutorialTitle'>Scoundrel rules</div>
              <div className='tutorialText'>The rules of the game are simple - you have to go through the whole deck of cards and survive. All cards with ♣ Clubs or ♠ Spades suits are considered monsters who you have to fight, ♦ Diamonds are weapons which help you dealing with enemies lending you their power, but each time you use them their potential gets lower so that they can only be used to fight a card weaker than their most recently defeated opponent. If the room seems to tough to explore, you can skip it but remember - you are then forced to take the next room head on without an option to run. In case you lose life during your journey there are health potions scattered around the dungeon - ♥ Hearts. Your end score is the power of the remaining monsters in the deck or your health at the end of your adventure, having a potion as your final pickup will grant a bonus to your final score.</div>
              <div style={{padding: "10px", display: "flex", justifyContent: "center", alignItems: "center"}}>
                <button onClick={() => {drawCards(4); setTutorial(false)}}>
                  Start your adventure
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      <button className='settingsButton' onClick={() => setMenu(true)}>
        Settings
      </button>
      {menu && (
        <>
          <div className='overlay'>
            <div className='settings'>
              <div className='tutorialTitle'>
                Settings
              </div>
              <div className='settingsContent'>
                <div style={{padding: "20px", top: "10px"}}>
                  Deck color:
                  <select value={deckColor} onChange={(e) => setDeckColor(e.target.value)} style={{margin: "10px"}}>
                    <option value={"green"}>Green</option>
                    <option value={"red"}>Red</option>
                    <option value={"blue"}>Blue</option>
                    <option value={"black"}>Black</option>
                    <option value={"yellow"}>Yellow</option>
                  </select>
                </div>
                <button onClick={() => setMenu(false)} className='closeButton'>
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default App
