"""
Seed Data Script for AdCraft Creator Marketplace

Populates realistic dummy creators, brand owners, portfolios (videos & images),
projects, and direct messages so the discovery feed and marketplace are rich with content.
"""

from database import SessionLocal
from models.user import User
from models.portfolio import Portfolio
from models.project import Project
from models.direct_message import DirectMessage
from auth import hash_password

def seed_database():
    db = SessionLocal()

    try:
        print("--- Seeding database with dummy data ---")

        # ── 1. Create Creators ──────────────────────────────────────────────
        creators_data = [
            {
                "name": "Elena Rostova",
                "email": "elena.rostova@creator.com",
                "password_hash": hash_password("creator123"),
                "role": "creator",
                "profile_image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
                "cover_image": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=80",
                "bio": "UGC Beauty & Skincare specialist with 4+ years creating high-converting TikTok Reels & Instagram video ads.",
                "skills": "UGC Video, Skincare Demo, Unboxing, Voiceover, Aesthetic Editing",
                "niche": "Fashion & Beauty",
                "location": "New York, USA",
                "languages": "English, Russian",
                "is_available_for_work": True,
                "pricing_info": "$250 per UGC Reel",
                "rating": 4.9,
                "experience_years": 4,
                "social_instagram": "https://instagram.com/elena_creator",
                "social_tiktok": "https://tiktok.com/@elena_ugc",
                "social_youtube": "https://youtube.com/@elenarostova",
                "portfolios": [
                    {
                        "title": "Hydrating Serum 30s Hook Reel",
                        "description": "High ROAS UGC ad hook demonstrating bottle texture and skincare glow.",
                        "media_url": "https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/bottle-detection.mp4",
                        "media_type": "video",
                    },
                    {
                        "title": "Aesthetic Glass Skin Product Showcase",
                        "description": "Flatlay photography & product b-roll for Instagram feed.",
                        "media_url": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80",
                        "media_type": "image",
                    },
                ]
            },
            {
                "name": "Marcus Thorne",
                "email": "marcus.t@creator.com",
                "password_hash": hash_password("creator123"),
                "role": "creator",
                "profile_image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
                "cover_image": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80",
                "bio": "Tech reviewer & gadget unboxer. I help hardware & app brands convert cold traffic into buyers.",
                "skills": "Tech Review, 4K B-Roll, Smartphone Ads, App Walkthrough, Scripting",
                "niche": "Tech & Gadgets",
                "location": "San Francisco, USA",
                "languages": "English",
                "is_available_for_work": True,
                "pricing_info": "$350 per 60s Tech Ad",
                "rating": 5.0,
                "experience_years": 5,
                "social_instagram": "https://instagram.com/marcustech",
                "social_youtube": "https://youtube.com/@marcusthornereviews",
                "portfolios": [
                    {
                        "title": "ANC Wireless Headphones Review",
                        "description": "Cinematic tech review highlighting noise cancellation and audio response.",
                        "media_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
                        "media_type": "video",
                    },
                    {
                        "title": "Smart Watch Unboxing B-Roll",
                        "description": "Clean desk setup shots with macro closeups.",
                        "media_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
                        "media_type": "image",
                    },
                ]
            },
            {
                "name": "Sophia Chen",
                "email": "sophia.chen@creator.com",
                "password_hash": hash_password("creator123"),
                "role": "creator",
                "profile_image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80",
                "cover_image": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&auto=format&fit=crop&q=80",
                "bio": "Certified fitness trainer creating energetic workout, supplement, and activewear video content.",
                "skills": "Fitness Content, Supplement Hook, Activewear Try-On, Voiceover",
                "niche": "Fitness & Health",
                "location": "Los Angeles, USA",
                "languages": "English, Mandarin",
                "is_available_for_work": True,
                "pricing_info": "$200 per Workout Reel",
                "rating": 4.8,
                "experience_years": 3,
                "social_instagram": "https://instagram.com/sophiachenfit",
                "social_tiktok": "https://tiktok.com/@sophiachenfit",
                "portfolios": [
                    {
                        "title": "Pre-Workout Energy Drink Hook",
                        "description": "High-energy outdoor workout video ad showing active movement.",
                        "media_url": "https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/person-bicycle-car-detection.mp4",
                        "media_type": "video",
                    },
                ]
            },
            {
                "name": "David Miller",
                "email": "david.m@creator.com",
                "password_hash": hash_password("creator123"),
                "role": "creator",
                "profile_image": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80",
                "cover_image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80",
                "bio": "Culinary videographer & food blogger. Creating mouth-watering recipe videos for gourmet brands.",
                "skills": "Food Styling, Recipe Videos, Kitchen B-Roll, Overhead Cooking",
                "niche": "Food & Beverage",
                "location": "Chicago, USA",
                "languages": "English",
                "is_available_for_work": False,
                "pricing_info": "$180 per Recipe Video",
                "rating": 4.9,
                "experience_years": 4,
                "social_instagram": "https://instagram.com/davidcooks",
                "portfolios": [
                    {
                        "title": "Artisanal Coffee Brewer Demo",
                        "description": "Pour-over coffee recipe & retail gourmet ingredient b-roll.",
                        "media_url": "https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/store-aisle-detection.mp4",
                        "media_type": "video",
                    },
                ]
            },
            {
                "name": "Chloe Bennett",
                "email": "chloe.b@creator.com",
                "password_hash": hash_password("creator123"),
                "role": "creator",
                "profile_image": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80",
                "cover_image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80",
                "bio": "Travel & luxury lifestyle creator. I craft cinematic hotel, luggage, and travel gear promotional Reels.",
                "skills": "Drone Footage, Travel Vlogging, Resort Ads, Cinematic B-Roll",
                "niche": "Travel",
                "location": "Miami, USA",
                "languages": "English, Spanish",
                "is_available_for_work": True,
                "pricing_info": "$300 per Travel Reel",
                "rating": 5.0,
                "experience_years": 6,
                "social_instagram": "https://instagram.com/chloetravels",
                "social_tiktok": "https://tiktok.com/@chloe_adventures",
                "portfolios": [
                    {
                        "title": "Carry-On Luggage & Resort Test",
                        "description": "Cinematic travel footage showcasing luxury resort & travel gear.",
                        "media_url": "https://vjs.zencdn.net/v/oceans.mp4",
                        "media_type": "video",
                    },
                ]
            },
        ]

        for c_data in creators_data:
            portfolios_data = c_data.pop("portfolios", [])
            existing = db.query(User).filter(User.email == c_data["email"]).first()
            if not existing:
                creator = User(**c_data)
                db.add(creator)
                db.commit()
                db.refresh(creator)
                print(f"  Added creator: {creator.name}")

                for p in portfolios_data:
                    port = Portfolio(creator_id=creator.id, **p)
                    db.add(port)
                db.commit()
            else:
                print(f"  Updating existing creator portfolio: {c_data['name']}")
                # Refresh portfolio links if needed
                db.query(Portfolio).filter(Portfolio.creator_id == existing.id).delete()
                for p in portfolios_data:
                    port = Portfolio(creator_id=existing.id, **p)
                    db.add(port)
                db.commit()

        # ── 2. Create Brand Owners ──────────────────────────────────────────
        brands_data = [
            {
                "name": "Lumiere Skincare",
                "email": "contact@lumiereskin.com",
                "password_hash": hash_password("brand123"),
                "role": "brand_owner",
                "profile_image": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop&q=80",
                "bio": "Premium organic skincare brand focused on clean beauty and glass skin results.",
            },
            {
                "name": "AuraSound Audio",
                "email": "marketing@aurasound.io",
                "password_hash": hash_password("brand123"),
                "role": "brand_owner",
                "profile_image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80",
                "bio": "Direct-to-consumer audio company engineering audiophile wireless headphones.",
            },
        ]

        for b_data in brands_data:
            existing = db.query(User).filter(User.email == b_data["email"]).first()
            if not existing:
                brand = User(**b_data)
                db.add(brand)
                db.commit()
                db.refresh(brand)
                print(f"  Added brand: {brand.name}")

                # Create sample projects for the brand
                if brand.name == "Lumiere Skincare":
                    proj = Project(
                        owner_id=brand.id,
                        title="Summer Glow Vitamin C Serum UGC Campaign",
                        product_name="Lumiere Vitamin C Glow Serum",
                        description="Looking for 3 female UGC creators to record 30-second unboxing and application reels showing daily morning skincare routine.",
                        target_audience="Women 18-35 interested in skincare and glow beauty",
                        platform="instagram",
                        budget=450.0,
                        status="open",
                    )
                    db.add(proj)
                    db.commit()

        print("SUCCESS: Database seeding complete!")

    except Exception as e:
        print(f"ERROR seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
