"""Existing owner tags remain valid; new imports must not recreate the retired category."""
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from portfolio_maps import ALL_PREFIX, PRODUCT_PREFIX, categories_for, unmapped


class PortfolioCategoryMergeTests(unittest.TestCase):
    def test_completed_box_and_casket_tags_share_one_deduplicated_category(self):
        box = 'Коробки, ящики из фанеры'
        casket = 'Шкатулки из фанеры'
        for tags in ([box], [casket], [box, casket], [casket, box], [casket, casket]):
            with self.subTest(tags=tags):
                self.assertEqual(categories_for(tags), ['koroba-fanera'])
                self.assertEqual(unmapped(tags), [])
        self.assertEqual(PRODUCT_PREFIX[box], PRODUCT_PREFIX[casket])
        self.assertNotIn('shkatulki-fanera', ALL_PREFIX.values())
        # Mixed imports retain unrelated mappings without pinning their editable values.
        for tag, prefix in ALL_PREFIX.items():
            if prefix != 'koroba-fanera':
                with self.subTest(unrelated_tag=tag):
                    self.assertEqual(categories_for([tag, casket, box, tag]),
                                     [prefix, 'koroba-fanera'])
        self.assertEqual(unmapped([casket, 'Пропустить (не в тему)', 'unknown']), ['unknown'])

    def test_raw_owner_checkbox_and_shared_mapping_consumers_are_retained(self):
        self.assertIn('"Шкатулки из фанеры"', (ROOT / 'photo_tagger.py').read_text(encoding='utf-8'))
        for consumer in ('import_new.py', 'publish_photos.py'):
            self.assertIn('portfolio_maps import', (ROOT / consumer).read_text(encoding='utf-8'))


if __name__ == '__main__':
    unittest.main()
