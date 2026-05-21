type SpeciesImage = {
  imageUrl: string;
};

export function normalizeSpeciesImageKey(name?: string | null) {
  return (name ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// TEMP_STATIC_SPECIES_IMAGES: educational image enrichment for the Fishidex.
// These are stable public Wikimedia/Wikipedia HTTPS URLs, kept frontend-side until species media becomes backend-native.
const speciesImagesByName: Record<string, SpeciesImage> = {
  'ablette': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/AlburnusAlburnus1.JPG/960px-AlburnusAlburnus1.JPG' },
  'alose feinte': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Alosa_fallax.jpg/960px-Alosa_fallax.jpg' },
  'amour blanc': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Grass_carp_fexx.jpg' },
  'anchois': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Boquerones_%28Engraulis_encrasicolus%29%2C_Set%C3%BAbal%2C_Portugal%2C_2020-08-01%2C_DD_16.jpg/960px-Boquerones_%28Engraulis_encrasicolus%29%2C_Set%C3%BAbal%2C_Portugal%2C_2020-08-01%2C_DD_16.jpg' },
  'anguille': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Anguilla_anguilla.jpg' },
  'aspe': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Aspius_aspius_Prague_Vltava_2.jpg/960px-Aspius_aspius_Prague_Vltava_2.jpg' },
  'bar': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Dicentrarchus_labrax01.jpg/960px-Dicentrarchus_labrax01.jpg' },
  'bar mouchete': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Dicentrarchus_punctatus.jpg' },
  'barbeau fluviatile': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Barbe_Tiergarten_Schoenbrunn_%28cropped%29_barbeau.jpg/960px-Barbe_Tiergarten_Schoenbrunn_%28cropped%29_barbeau.jpg' },
  'black bass': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/LargemouthBass.jpg' },
  'bonite': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Sarda_sarda.jpg' },
  'breme commune': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Carp_bream.jpg/960px-Carp_bream.jpg' },
  'brochet': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Esox_lucius1.jpg/960px-Esox_lucius1.jpg' },
  'carassin': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/CarassiusCarassius8.JPG/960px-CarassiusCarassius8.JPG' },
  'carpe commune': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Common_carp.jpg' },
  'carpe miroir': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Mirror_carp_2008_G1.jpg/960px-Mirror_carp_2008_G1.jpg' },
  'chabot': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/57/Cottus_gobio.jpg' },
  'chevesne': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Squalius_cephalus_Prague_Vltava_1.jpg/960px-Squalius_cephalus_Prague_Vltava_1.jpg' },
  'chinchard': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Trachurus_trachurus.jpg/960px-Trachurus_trachurus.jpg' },
  'congre': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Conger_eel01.jpg' },
  'coregone': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Coregonus_lavaretus.jpg/960px-Coregonus_lavaretus.jpg' },
  'cristivomer': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Lake_trout_fish_in_hands_salvelinus_namaycush.jpg/960px-Lake_trout_fish_in_hands_salvelinus_namaycush.jpg' },
  'denti': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Dentex_dentex_1.jpg' },
  'dorade royale': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Goudbrasem002.jpg/960px-Goudbrasem002.jpg' },
  'emissole': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Mustelus_californicus_SEA_LIFE.jpg/960px-Mustelus_californicus_SEA_LIFE.jpg' },
  'epinoche': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Gasterosteus_aculeatus.jpg' },
  'epinochette': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Pungitius_laevis.jpg' },
  'esturgeon': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/St%C3%B6r_-_Sturgeon.jpg/960px-St%C3%B6r_-_Sturgeon.jpg' },
  'flet': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Flounder_1.jpg/960px-Flounder_1.jpg' },
  'gardon': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Blausteinsee_Tierwelt_03.jpg/960px-Blausteinsee_Tierwelt_03.jpg' },
  'goujon': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/71/Riviergrondel.jpg' },
  'grande alose': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Alosa_alosa.jpg' },
  'grondin rouge': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Aspitrigla_cuculus.jpg/960px-Aspitrigla_cuculus.jpg' },
  'hotu': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Chondrostoma_nasus_%28aka%29.jpg/960px-Chondrostoma_nasus_%28aka%29.jpg' },
  'ide melanote': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Aland.jpg' },
  'lamproie fluviatile': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/J%C3%B5esilmud2.jpg/960px-J%C3%B5esilmud2.jpg' },
  'lamproie marine': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Petromyzon_marinus2.jpg/960px-Petromyzon_marinus2.jpg' },
  'lieu jaune': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Pollachius_pollachius_aquarium.jpg/960px-Pollachius_pollachius_aquarium.jpg' },
  'lieu noir': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Pollachius_virens.jpg/960px-Pollachius_virens.jpg' },
  'limande': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Microstomus_kitt_1.jpg/960px-Microstomus_kitt_1.jpg' },
  'lingue franche': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Molva_molva_155653858.jpg/960px-Molva_molva_155653858.jpg' },
  'loche franche': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Barbatula_barbatula.jpg/960px-Barbatula_barbatula.jpg' },
  'lotte de riviere': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Lota_lota_252741459.jpg/960px-Lota_lota_252741459.jpg' },
  'maigre': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Lisbon%2C_Oceanarium%2C_Argyrosomus_regius.JPG/960px-Lisbon%2C_Oceanarium%2C_Argyrosomus_regius.JPG' },
  'maquereau': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Scomber_scombrus.jpg/960px-Scomber_scombrus.jpg' },
  'marbre': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Mormora.jpg/960px-Mormora.jpg' },
  'merlan': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Wijting002.jpg/960px-Wijting002.jpg' },
  'merou brun': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Mero_%28Epinephelus_marginatus%29%2C_Cabo_de_Palos%2C_Espa%C3%B1a%2C_2022-07-16%2C_DD_27.jpg/960px-Mero_%28Epinephelus_marginatus%29%2C_Cabo_de_Palos%2C_Espa%C3%B1a%2C_2022-07-16%2C_DD_27.jpg' },
  'morue': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Morue.jpg/960px-Morue.jpg' },
  'mostelle': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/65/Phycis_phycis.jpg' },
  'mulet': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Liza_saliens1.jpg/960px-Liza_saliens1.jpg' },
  'mulet dore': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Liza_aurata.jpg' },
  'mulet porc': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Liza_ramada.jpg' },
  'oblade': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Capo_Gallo_Oblada_melanura.jpg' },
  'omble chevalier': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Salvelinusalpinus.jpg' },
  'ombre commun': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Grayling_Thymallus_thymallus.JPG/960px-Grayling_Thymallus_thymallus.JPG' },
  'pageot commun': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Pagellus_erythrinus_RO.jpg' },
  'pagre': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Pagrus_pargus_2_by_Line1.jpg/960px-Pagrus_pargus_2_by_Line1.jpg' },
  'perche': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Perchepetitetaille.jpg' },
  'plie': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Pleuronectes_platessa.jpg/960px-Pleuronectes_platessa.jpg' },
  'raie bouclee': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Raja_clavata_%28juv%29.jpg/960px-Raja_clavata_%28juv%29.jpg' },
  'raie brunette': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Raya_mosaico_%28Raja_undulata%29%2C_Parque_natural_de_la_Arr%C3%A1bida%2C_Portugal%2C_2020-07-21%2C_DD_92-93_PAN.jpg/960px-Raya_mosaico_%28Raja_undulata%29%2C_Parque_natural_de_la_Arr%C3%A1bida%2C_Portugal%2C_2020-07-21%2C_DD_92-93_PAN.jpg' },
  'rascasse rouge': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Grosserdrachenkopf-02.jpg' },
  'rotengle': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Scardinius_erythropthalmus_2009_G1.jpg/960px-Scardinius_erythropthalmus_2009_G1.jpg' },
  'rouget barbet': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Mullus_surmuletus.jpg/960px-Mullus_surmuletus.jpg' },
  'roussette': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Scyliorhinus_canicula.jpg/960px-Scyliorhinus_canicula.jpg' },
  'sandre': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Sander_lucioperca_1.jpg/960px-Sander_lucioperca_1.jpg' },
  'sar a tete noire': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Mojarra_%28Diplodus_vulgaris%29%2C_Cabo_de_Palos%2C_Espa%C3%B1a%2C_2022-07-17%2C_DD_80.jpg/960px-Mojarra_%28Diplodus_vulgaris%29%2C_Cabo_de_Palos%2C_Espa%C3%B1a%2C_2022-07-17%2C_DD_80.jpg' },
  'sardine': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Sardina_pilchardus.jpg/960px-Sardina_pilchardus.jpg' },
  'sars commun': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Diplodus_sargus_01.jpg/960px-Diplodus_sargus_01.jpg' },
  'saumon atlantique': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Wst_atlantischer_lachs_stoer_001.jpg' },
  'saupe': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salema_%28Sarpa_salpa%29%2C_franja_marina_Teno-Rasca%2C_Tenerife%2C_Espa%C3%B1a%2C_2022-01-09%2C_DD_42.jpg/960px-Salema_%28Sarpa_salpa%29%2C_franja_marina_Teno-Rasca%2C_Tenerife%2C_Espa%C3%B1a%2C_2022-01-09%2C_DD_42.jpg' },
  'saint pierre': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Zeus.faber_2.jpg' },
  'silure': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Freischwimmender_Wels.jpg/960px-Freischwimmender_Wels.jpg' },
  'sole commune': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Solea_solea_1.jpg/960px-Solea_solea_1.jpg' },
  'tacaud': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Trisopterus_luscus%2801%29.jpg/960px-Trisopterus_luscus%2801%29.jpg' },
  'tanche': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/FemaleTench1.JPG/960px-FemaleTench1.JPG' },
  'thon rouge': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Bluefin-big.jpg/960px-Bluefin-big.jpg' },
  'truite arc en ciel': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Truite_arc-en-ciel.jpg' },
  'truite de mer': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Wst_meerforelle_stoer_001.jpg' },
  'truite fario': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Salmo_trutta.jpg/960px-Salmo_trutta.jpg' },
  'turbot': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Psetta_maxima1.jpg/960px-Psetta_maxima1.jpg' },
  'vairon': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Vairon_WIKI800px.JPG' },
  'vandoise': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Leuciscus_leuciscus_Hungary.jpg' },
  'vieille commune': { imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Labrus_bergylta.jpg/960px-Labrus_bergylta.jpg' },
};

export function enrichSpeciesImage(name?: string | null) {
  return speciesImagesByName[normalizeSpeciesImageKey(name)] ?? null;
}

export function hasSpeciesImage(name?: string | null) {
  return Boolean(enrichSpeciesImage(name));
}
